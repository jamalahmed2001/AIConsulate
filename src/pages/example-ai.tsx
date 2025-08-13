import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";
import { api } from "@/utils/api";

const MODEL_OPTIONS = [
  { value: "gpt-3.5", label: "GPT-3.5 (1 credit)", cost: 1 },
  { value: "gpt-4", label: "GPT-4 (5 credits)", cost: 5 },
  { value: "claude", label: "Claude (3 credits)", cost: 3 }
];

export default function ExampleAIPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-3.5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current credit balance
  const { data: credits, refetch: refetchCredits } = api.entitlements.getCredits.useQuery(
    undefined,
    { enabled: !!session?.user }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== "authenticated") {
      await router.push("/auth/signin?callbackUrl=/example-ai");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/example/use-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model })
      });

      const raw: unknown = await response.json();
      const data = raw as { required?: number; balance?: number; error?: string; result?: string };

      if (!response.ok) {
        if (response.status === 402) {
          setError(`Insufficient credits. You need ${String(data.required ?? "?")} credits but only have ${String(data.balance ?? "?")}.`);
        } else {
          setError(data.error ?? "Something went wrong");
        }
        return;
      }

      setResult(data.result ?? null);
      // Refresh credit balance
      await refetchCredits();
    } catch {
      setError("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const selectedModelCost = MODEL_OPTIONS.find(m => m.value === model)?.cost ?? 1;
  const hasEnoughCredits = (credits?.balance ?? 0) >= selectedModelCost;

  return (
    <>
      <NextSeo
        title="AI Example — AI Consulate Advisory"
        description="Example of using AI features with the credit system"
      />

      <main className="min-h-screen">
        <PageHeader
          title="AI Example"
          subtitle="Try our AI features powered by the credit system"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Example" }
          ]}
        />

        {/* Credit Balance */}
        <Section tone="surface">
          <Card className="mx-auto max-w-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your Credit Balance</h2>
                <p className="text-2xl font-bold text-brand-600">
                  {credits?.balance ?? 0} Credits
                </p>
              </div>
              <CTA href="/credits" tone="secondary" label="Buy Credits" />
            </div>

            {/* AI Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                  Your Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                  placeholder="Enter your prompt here..."
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  AI Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                  disabled={loading}
                >
                  {MODEL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <CTA
                type="submit"
                disabled={loading || !hasEnoughCredits}
                fullWidth
                label={
                  loading 
                    ? "Processing..." 
                    : !hasEnoughCredits 
                    ? `Need ${selectedModelCost} credits` 
                    : `Generate (${selectedModelCost} credits)`
                }
              />
            </form>

            {/* Result */}
            {result && (
              <div className="mt-6 rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">AI Response:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
              </div>
            )}
          </Card>
        </Section>

        {/* How It Works */}
        <Section title="How Credit Usage Works">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <h3 className="mb-2 font-semibold">1. Choose Your Model</h3>
                <p className="text-sm text-gray-600">
                  Different AI models cost different amounts of credits based on their capabilities.
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 font-semibold">2. Submit Your Request</h3>
                <p className="text-sm text-gray-600">
                  Credits are deducted when you submit a request. If you don&apos;t have enough, you&apos;ll be prompted to buy more.
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 font-semibold">3. Get Your Results</h3>
                <p className="text-sm text-gray-600">
                  Your remaining balance is shown after each request. Credits are only charged for successful operations.
                </p>
              </Card>
            </div>
          </div>
        </Section>
      </main>
    </>
  );
}
