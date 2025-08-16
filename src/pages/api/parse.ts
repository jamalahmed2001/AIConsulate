import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { verifyAccessToken } from "@/server/auth/tokens";
import { callChatModel } from "@/server/ai/llm";
import { db } from "@/server/db";

const inputSchema = z.object({
  idempotencyKey: z.string().min(8),
  schema: z.union([z.string().min(1), z.record(z.any())]).optional(),
  instructions: z.string().optional(),
  page: z.object({
    url: z.string().url(),
    title: z.string().optional(),
    lang: z.string().optional(),
    content: z.string().min(1),
    html: z.string().min(1),
    metadata: z
      .array(z.object({ name: z.string().nullable(), content: z.string().nullable() }))
      .optional(),
  }),
  mode: z.enum(["page", "selection"]).default("page"),
  model: z.string().optional(),
  provider: z.enum(["openai", "openrouter"]).optional(),
});

const CREDITS_PER_PARSE = 5;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS for extension
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();

  // Auth via extension/server token
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
  const token = auth.slice("Bearer ".length);
  const payload = await verifyAccessToken(token);
  if (!payload) return res.status(401).json({ error: "invalid token" });

  // Parse body
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { idempotencyKey, schema, instructions, page, mode, provider, model } = parsed.data;

  // Idempotency: if we processed this parse already, return last result
  let existingResult: unknown;
  try {
    const existing = (await db.usageEvent.findFirst({ where: { idempotencyKey } })) as
      | { resultJson?: unknown }
      | null;
    existingResult = existing?.resultJson ?? undefined;
  } catch {
    // If the column does not exist yet, skip idempotency replay
  }
  if (existingResult !== undefined && existingResult !== null) {
    return res.status(200).json({ ok: true, data: existingResult, idempotent: true });
  }

  // Check balance and spend atomically
  const result = await db.$transaction(async (tx) => {
    const balAgg = await tx.creditLedger.aggregate({ _sum: { delta: true }, where: { userId: payload.userId } });
    const currentBalance = balAgg._sum.delta ?? 0;
    if (currentBalance < CREDITS_PER_PARSE) {
      return { ok: false as const, error: "insufficient_balance", balance: currentBalance };
    }
    await tx.creditLedger.create({
      data: {
        userId: payload.userId,
        delta: -CREDITS_PER_PARSE,
        currency: "credits",
        reason: `spend:parse-${mode}`,
        source: "usage",
        sourceRef: idempotencyKey,
        balanceAfter: currentBalance - CREDITS_PER_PARSE,
      },
    });
    const created = await tx.usageEvent.create({
      data: {
        userId: payload.userId,
        meterCode: `parse:${mode}`,
        quantity: CREDITS_PER_PARSE,
        idempotencyKey,
      },
    });
    return { ok: true as const, spendEventId: created.id };
  });

  if (!result.ok) return res.status(402).json(result);

  // Build LLM prompt (auto if no instructions/schema provided)
  const isAuto = !instructions && !schema;
  const schemaAsText = schema
    ? typeof schema === "string"
      ? schema
      : JSON.stringify(schema, null, 2)
    : undefined;
  const system = isAuto
    ? `You are an expert web content analyst.
Always respond with strictly valid minified JSON (no code fences).
Infer the page type and return an appropriate structured representation capturing the most useful information.
General guidance for the JSON:
- top-level keys: type (string), url (string), title (string), summary (string), data (object), items (array) when list-like content is present
- include sections, headings, links, contacts, prices, tables, entities when relevant
- do not hallucinate; only include information present in the content
- use concise camelCase keys; avoid verbose prose
`
    : `You are a precise, structured web content parser. Extract only what is requested. Respond with strictly valid JSON that conforms to the provided JSON schema or example shape.`;
  const userParts: Array<string | null> = [
    `URL: ${page.url}`,
    page.title ? `Title: ${page.title}` : null,
    page.lang ? `Lang: ${page.lang}` : null,
    `Mode: ${mode}`,
  ];
  if (isAuto) {
    userParts.push(`Auto mode enabled: infer suitable JSON structure based on content.`);
  } else {
    if (instructions) userParts.push(`Instructions: ${instructions}`);
    if (schemaAsText) userParts.push(`Schema or Example JSON shape to follow (respond matching this):\n${schemaAsText}`);
  }
  userParts.push(`--- PAGE CONTENT (text) ---\n${page.content}`);
  // Include full HTML so the model can parse structure when helpful
  userParts.push(`--- PAGE HTML (full) ---\n${page.html}`);
  const user = userParts.filter(Boolean).join("\n");

  // Call model
  const llm = await callChatModel({
    provider: provider ?? "openrouter",
    model: model ?? "google/gemma-3-27b-instruct",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    maxTokens: 1500,
    temperature: 0.1,
  });

  // Best-effort JSON parse with fallback
  let json: unknown = null;
  try {
    const trimmed = llm.content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
    json = JSON.parse(trimmed);
  } catch {
    json = { raw: llm.content };
  }

  // Attach result to usage event for idempotency replay
  try {
    // The `resultJson` column may not exist in all environments yet. We intentionally
    // bypass strict typing for this update and ignore failures.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    await (db.usageEvent as any).update({
      where: { idempotencyKey },
      data: { resultJson: json },
    });
  } catch {
    // Column may not exist; ignore persistence of resultJson
  }

  return res.status(200).json({ ok: true, data: json });
}


