import { NextSeo } from "next-seo";
import { useState } from "react";
import { z } from "zod";
import { Section } from "@/components/ui/Section";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Reveal } from "@/components/ui/Reveal";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  budget: z.string().optional(),
  goals: z.string().optional(),
  message: z.string().min(10),
});

export default function ContactPage() {
  const [values, setValues] = useState<Record<string, string>>({
    name: "",
    email: "",
    company: "",
    budget: "",
    goals: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError("Please fix validation errors.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setValues({
        name: "",
        email: "",
        company: "",
        budget: "",
        goals: "",
        message: "",
      });
    } catch {
      setStatus("error");
      setError("Could not submit. Try again later.");
    }
  }

  return (
    <>
      <NextSeo
        title="Contact — AI Consulate Advisory"
        description="Tell us where you want to be in 90 days. We'll reply within one business day."
        openGraph={{
          title: "Contact — AI Consulate Advisory",
          description: "Tell us where you want to be in 90 days. We'll reply within one business day.",
        }}
      />
      <main className="min-h-screen text-neutral-900 dark:text-neutral-100">
        <Section
          title="Contact"
          subtitle="Tell us where you want to be in 90 days. We'll reply within one business day."
          className="bg-white"
        >
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Reveal>
              <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                value={values.name}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setValues((v) => ({ ...v, name: value }));
                }}
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={values.email}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setValues((v) => ({ ...v, email: value }));
                }}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Company
                </label>
                <Input
                  value={values.company}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setValues((v) => ({ ...v, company: value }));
                }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Budget</label>
                <Input
                  value={values.budget}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setValues((v) => ({ ...v, budget: value }));
                }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Goals</label>
              <Textarea
                value={values.goals}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setValues((v) => ({ ...v, goals: value }));
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Message</label>
              <Textarea
                value={values.message}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setValues((v) => ({ ...v, message: value }));
                }}
                required
                minLength={10}
                rows={5}
              />
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="bg-brand-700 hover:bg-brand-800 rounded-[var(--radius-md)] px-4 py-2 text-white disabled:opacity-50"
            >
              {status === "submitting" ? "Submitting..." : "Send message"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {status === "success" && (
              <p className="text-sm text-green-600">
                Thanks — we’ll reach out shortly.
              </p>
            )}
              </form>
            </Reveal>

            {/* Contact Information */}
            <Reveal delayMs={200}>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">What to expect</h3>
                  <ul className="space-y-3 text-sm text-neutral-700">
                    <li className="flex items-start gap-3">
                      <span className="text-green-600">✓</span>
                      <div>
                        <strong>Quick response:</strong> We&apos;ll get back to you within one business day with next steps.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600">✓</span>
                      <div>
                        <strong>Discovery call:</strong> 30-minute conversation to understand your goals and challenges.
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600">✓</span>
                      <div>
                        <strong>Clear proposal:</strong> Specific scope, timeline, and success criteria within a week.
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Common starting points</h3>
                  <div className="space-y-4">
                    <div className="rounded-[var(--radius-lg)] border bg-neutral-50 p-4">
                      <h4 className="font-medium mb-2">Discovery ($8k, 2 weeks)</h4>
                      <p className="text-sm text-neutral-700">
                        Perfect for organizations just starting their AI journey. Clear strategy and roadmap.
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border bg-neutral-50 p-4">
                      <h4 className="font-medium mb-2">Accelerator ($28k, 4-6 weeks)</h4>
                      <p className="text-sm text-neutral-700">
                        Build and validate your first AI automation or agent with real business impact.
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border bg-neutral-50 p-4">
                      <h4 className="font-medium mb-2">Partnership (From $12k/mo)</h4>
                      <p className="text-sm text-neutral-700">
                        Ongoing AI delivery team for multiple workstreams and continuous optimization.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Before we talk</h3>
                  <p className="text-sm text-neutral-700 mb-3">
                    To make our conversation more productive, it helps to think through:
                  </p>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>• What specific business process would you like to improve?</li>
                    <li>• How do you currently measure success in that area?</li>
                    <li>• What would a 25% improvement look like in numbers?</li>
                    <li>• Who would need to be involved in evaluating a solution?</li>
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* FAQ Section */}
        <Section 
          title="Common questions"
          subtitle="Answers to help you decide if we're a good fit."
          className="bg-neutral-50"
        >
          <Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold mb-2">Do you work with our existing team?</h3>
                <p className="text-sm text-neutral-700">
                  Yes. We enable your team rather than replace them. Every engagement includes knowledge transfer and training.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold mb-2">How do you handle security?</h3>
                <p className="text-sm text-neutral-700">
                  We align with your security policies and implement least-privilege access by default. SOC compliance available.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold mb-2">What if the project doesn&apos;t work out?</h3>
                <p className="text-sm text-neutral-700">
                  We define clear success criteria upfront. If scope changes, we pause and realign rather than continuing blindly.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border bg-white p-6 shadow-[var(--shadow-card)]">
                <h3 className="font-semibold mb-2">How quickly can we get started?</h3>
                <p className="text-sm text-neutral-700">
                  Typically 1-2 weeks from agreement to kickoff. We start with discovery workshops before any development.
                </p>
              </div>
            </div>
          </Reveal>
        </Section>
      </main>
    </>
  );
}
