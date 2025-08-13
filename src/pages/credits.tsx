import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";
import { Reveal } from "@/components/ui/Reveal";
import { api } from "@/utils/api";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits?: number;
  interval?: string;
  popular?: boolean;
  features: string[];
  priceId: string;
  mode: "payment" | "subscription";
}

export default function CreditsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const utils = api.useUtils();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customCredits, setCustomCredits] = useState<number>(1000);
  const [isCustomCheckout, setIsCustomCheckout] = useState(false);

  // Fetch user's current credit balance and subscription
  const { data: userCredits } = api.entitlements.getCredits.useQuery(
    undefined,
    { enabled: !!session?.user }
  );
  
  const { data: subscription } = api.entitlements.getSubscription.useQuery(
    undefined,
    { enabled: !!session?.user }
  );

  // Confirm Stripe checkout on success as a webhook fallback
  useEffect(() => {
    const run = async () => {
      if (router.query.success === "1") {
        const sessionId = router.query.session_id as string | undefined;
        if (sessionId) {
          try {
            setLoading("confirm-session");
            await fetch("/api/billing/confirm-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            });
            // Revalidate queries
            await Promise.all([
              utils.entitlements.getCredits.invalidate(),
              utils.entitlements.getSubscription.invalidate(),
            ]);
          } catch {
            // Ignore; webhook should handle it
          } finally {
            setLoading(null);
            void router.replace("/credits", undefined, { shallow: true });
          }
        } else {
          void router.replace("/credits", undefined, { shallow: true });
        }
      } else if (router.query.canceled === "1") {
        setError("Payment was canceled. Please try again.");
        void router.replace("/credits", undefined, { shallow: true });
      }
    };
    void run();
  }, [router, utils.entitlements.getCredits, utils.entitlements.getSubscription]);

  // Example pricing plans - in production, fetch these from your database
  const creditPacks: PricingPlan[] = [
    {
      id: "pack-starter",
      name: "Starter Pack",
      price: 9.99,
      currency: "USD",
      credits: 100,
      features: [
        "100 AI Credits",
        "Never expires",
        "Use for any AI feature",
        "Email support"
      ],
       priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? "",
      mode: "payment"
    },
    {
      id: "pack-pro",
      name: "Pro Pack",
      price: 29.99,
      currency: "USD", 
      credits: 500,
      popular: true,
      features: [
        "500 AI Credits",
        "Never expires",
        "20% bonus credits",
        "Priority support"
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
      mode: "payment"
    },
    {
      id: "pack-enterprise",
      name: "Enterprise Pack",
      price: 99.99,
      currency: "USD",
      credits: 2000,
      features: [
        "2000 AI Credits",
        "Never expires", 
        "33% bonus credits",
        "Dedicated support"
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE ?? "",
      mode: "payment"
    }
  ];

  const subscriptionPlans: PricingPlan[] = [
    {
      id: "sub-monthly",
      name: "Monthly Pro",
      price: 19.99,
      currency: "USD",
      credits: 250,
      interval: "month",
      features: [
        "250 credits per month",
        "Auto-renewal",
        "10% bonus on all features",
        "Cancel anytime"
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? "",
      mode: "subscription"
    },
    {
      id: "sub-yearly",
      name: "Yearly Pro",
      price: 199.99,
      currency: "USD",
      credits: 3000,
      interval: "year",
      popular: true,
      features: [
        "3000 credits per year",
        "Save 17% vs monthly",
        "20% bonus on all features",
        "Priority support"
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY ?? "",
      mode: "subscription"
    }
  ];

  const handlePurchase = async (plan: PricingPlan) => {
    if (status !== "authenticated") {
      await router.push("/auth/signin?callbackUrl=/credits");
      return;
    }

    setLoading(plan.id);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          mode: plan.mode
        })
      });

      const raw: unknown = await response.json();
      const data = raw as { url?: string; error?: string };
      
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create checkout session");
      }

       if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  };

  const handleCustomPurchase = async () => {
    if (status !== "authenticated") {
      await router.push("/auth/signin?callbackUrl=/credits");
      return;
    }

    if (customCredits < 10 || customCredits > 100000) {
      setError("Please enter a credit amount between 10 and 100,000");
      return;
    }

    setIsCustomCheckout(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/dynamic-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: customCredits,
          mode: "payment"
        })
      });

      const raw: unknown = await response.json();
      const data = raw as { url?: string; error?: string };
      
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create checkout session");
      }

       if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsCustomCheckout(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
       currency: currency
    }).format(price);
  };

  return (
    <>
      <NextSeo
        title="AI Credits — AI Consulate Advisory"
        description="Purchase AI credits to power your automations and agents. Flexible pricing with no commitments."
        openGraph={{
          title: "AI Credits — AI Consulate Advisory",
          description: "Purchase AI credits to power your automations and agents."
        }}
      />

      <main className="min-h-screen">
        <PageHeader
          title="AI Credits"
          subtitle="Power your AI automations with flexible credit packages"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Credits" }
          ]}
        />

        {/* Current Balance Section */}
        {session && (
          <Section tone="surface">
            <Card className="mx-auto max-w-md p-6 text-center">
              <h2 className="mb-2 text-xl font-semibold">Your Credit Balance</h2>
              <div className="mb-4 text-4xl font-bold text-brand-600">
                {userCredits?.balance ?? 0} Credits
              </div>
              {subscription?.active && (
                <p className="text-sm text-gray-600">
                  Active subscription: {subscription.planName}
                </p>
              )}
            </Card>
          </Section>
        )}

        {/* Error Message */}
        {error && (
          <Section>
            <div className="mx-auto max-w-md rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </Section>
        )}

        {/* One-time Credit Packs */}
        <Section title="Credit Packs" subtitle="One-time purchases that never expire">
          <div className="grid gap-6 md:grid-cols-3">
            {creditPacks.map((plan) => (
              <Reveal key={plan.id}>
                <Card className={`relative p-6 ${plan.popular ? "ring-2 ring-brand-500" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                    </div>
                    <p className="mt-1 text-lg font-medium text-brand-600">
                      {plan.credits} Credits
                    </p>
                  </div>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <CTA
                    onClick={() => handlePurchase(plan)}
                    disabled={loading === plan.id}
                    fullWidth
                    tone={plan.popular ? "primary" : "secondary"}
                    label={loading === plan.id ? "Processing..." : "Buy Now"}
                  />
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Subscription Plans */}
        <Section 
          title="Subscription Plans" 
          subtitle="Auto-renewing plans with bonus features"
          tone="muted"
        >
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {subscriptionPlans.map((plan) => (
              <Reveal key={plan.id}>
                <Card className={`relative p-6 ${plan.popular ? "ring-2 ring-brand-500" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                        Best Value
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-3xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                      <span className="ml-1 text-gray-600">/{plan.interval}</span>
                    </div>
                    <p className="mt-1 text-lg font-medium text-brand-600">
                      {plan.credits} Credits
                    </p>
                  </div>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <svg className="mr-2 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <CTA
                    onClick={() => handlePurchase(plan)}
                    disabled={loading === plan.id || subscription?.active}
                    fullWidth
                    tone={plan.popular ? "primary" : "secondary"}
                    label={
                      subscription?.active 
                        ? "Already Subscribed" 
                        : loading === plan.id 
                        ? "Processing..." 
                        : "Subscribe"
                    }
                  />
                </Card>
              </Reveal>
            ))}
          </div>

          {/* Manage Subscription */}
          {subscription?.active && (
            <div className="mt-8 text-center">
              <CTA
                href="/api/billing/portal-link"
                tone="ghost"
                label="Manage Subscription"
              />
            </div>
          )}
        </Section>

        {/* Custom Credit Amount */}
        <Section 
          title="Need a Different Amount?" 
          subtitle="Purchase exactly the credits you need"
        >
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <div className="mb-4">
                <label htmlFor="custom-credits" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Credits
                </label>
                <input
                  id="custom-credits"
                  type="number"
                  min="10"
                  max="100000"
                  value={customCredits}
                   onChange={(e) => setCustomCredits(parseInt(e.target.value ?? "0", 10) || 0)}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-lg focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter amount"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum: 10 credits • Maximum: 100,000 credits
                </p>
              </div>
              
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Price per credit:</span>
                   <span className="text-sm font-medium">
                     {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                       (customCredits > 0 ? (customCredits >= 5000 ? 0.008 : customCredits >= 2000 ? 0.009 : customCredits >= 500 ? 0.0095 : 0.01) : 0)
                     )}
                     /credit
                   </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Price:</span>
                   <span className="text-2xl font-bold text-brand-600">
                     {formatPrice(
                       customCredits * (customCredits >= 5000 ? 0.008 : customCredits >= 2000 ? 0.009 : customCredits >= 500 ? 0.0095 : 0.01),
                       "USD"
                     )}
                   </span>
                </div>
                {customCredits >= 500 && (
                  <p className="mt-2 text-sm text-green-600">
                    {customCredits >= 5000 ? "20% volume discount applied!" : customCredits >= 2000 ? "10% volume discount applied!" : "5% volume discount applied!"}
                  </p>
                )}
              </div>
              
              <CTA
                onClick={handleCustomPurchase}
                disabled={isCustomCheckout || customCredits < 10 || customCredits > 100000}
                fullWidth
                tone="primary"
                label={isCustomCheckout ? "Processing..." : "Purchase Credits"}
              />
            </Card>
          </div>
        </Section>

        {/* How Credits Work */}
        <Section title="How Credits Work" tone="surface">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-4">
                <h3 className="mb-2 font-semibold">1 Credit = 1 AI Action</h3>
                <p className="text-sm text-gray-600">
                  Each AI operation consumes credits based on complexity and model used.
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 font-semibold">Never Expire</h3>
                <p className="text-sm text-gray-600">
                  Purchased credits never expire. Use them at your own pace.
                </p>
              </Card>
              <Card className="p-4">
                <h3 className="mb-2 font-semibold">Transparent Usage</h3>
                <p className="text-sm text-gray-600">
                  Track credit usage in real-time from your dashboard.
                </p>
              </Card>
            </div>
          </div>
        </Section>

        {/* CTA Section */}
        <Section tone="contrast">
          <Reveal className="text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Questions about credits?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <CTA href="/contact" size="lg" label="Contact Support" />
          </Reveal>
        </Section>

        {/* Browser Extension */}
        <Section title="Chrome Extension" subtitle="Check your balance from your browser" tone="surface">
          <div className="mx-auto max-w-2xl">
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <CTA href="/api/extension/download" label="Download Extension (.zip)" fullWidth />
                <button
                  onClick={async () => {
                    if (status !== "authenticated") {
                      await router.push("/auth/signin?callbackUrl=/credits");
                      return;
                    }
                    try {
                      setLoading("mint-token");
                      setError(null);
            const res = await fetch("/api/auth/mint-extension-token", { method: "POST" });
            const raw: unknown = await res.json();
            const data = raw as { accessToken?: string; error?: string };
            if (!res.ok) throw new Error(data.error ?? "Failed to mint token");
            await navigator.clipboard.writeText(String(data.accessToken ?? ""));
                      alert("Access token copied to clipboard. Paste it in the extension.");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to mint token");
                    } finally {
                      setLoading(null);
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 focus:outline-none disabled:opacity-50"
                  disabled={loading === "mint-token"}
                >
                  {loading === "mint-token" ? "Generating..." : "Generate Access Token"}
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                The token expires periodically for security. You can mint a new one anytime while signed in.
              </p>
            </Card>
          </div>
        </Section>
      </main>
    </>
  );
}
