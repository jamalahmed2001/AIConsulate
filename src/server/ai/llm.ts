import { env } from "@/env";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatRequest = {
  provider?: "openai" | "openrouter";
  model?: string;
  temperature?: number;
  maxTokens?: number;
  messages: ChatMessage[];
};

export type ChatResponse = {
  content: string;
  raw: unknown;
};

type ProviderConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  authHeader: string;
  headers: Record<string, string>;
};

function resolveProvider(override?: ChatRequest["provider"], modelOverride?: string): ProviderConfig {
  const provider = (override ?? process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  if (provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");
    return {
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey,
      model: modelOverride ?? process.env.LLM_MODEL ?? "openrouter/anthropic/claude-3.5-sonnet",
      authHeader: "Authorization",
      headers: { "HTTP-Referer": env.SITE_URL, "X-Title": "AI Consulate" },
    };
  }
  // default: openai compatible
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY or LLM_API_KEY");
  return {
    baseUrl: process.env.LLM_BASE_URL ?? "https://api.openai.com/v1",
    apiKey,
    model: modelOverride ?? process.env.LLM_MODEL ?? "gpt-4o-mini",
    authHeader: "Authorization",
    headers: {},
  };
}

type OpenAIChatResponse = { choices?: Array<{ message?: { content?: string } }>; [k: string]: unknown };

function extractContent(data: unknown): string {
  if (
    data &&
    typeof data === "object" &&
    "choices" in data &&
    Array.isArray((data as OpenAIChatResponse).choices)
  ) {
    const first = (data as OpenAIChatResponse).choices![0];
    const content = first?.message?.content;
    if (typeof content === "string") return content;
  }
  return "";
}

export async function callChatModel(req: ChatRequest): Promise<ChatResponse> {
  const provider = resolveProvider(req.provider, req.model);

  const body: Record<string, unknown> = {
    model: req.model ?? provider.model,
    temperature: req.temperature ?? 0.2,
    messages: req.messages,
    ...(req.maxTokens ? { max_tokens: req.maxTokens } : {}),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    [provider.authHeader]: `Bearer ${provider.apiKey}`,
    ...provider.headers,
  };

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM error ${response.status}: ${text}`);
  }
  const data = (await response.json()) as unknown;
  const content = extractContent(data);
  return { content, raw: data };
}


