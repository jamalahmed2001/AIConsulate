import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { CTA } from "@/components/ui/CTA";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/utils/api";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Fetch user's credits and subscription
  const { data: credits } = api.entitlements.getCredits.useQuery(
    undefined,
    { enabled: !!session?.user }
  );
  
  const { data: subscription } = api.entitlements.getSubscription.useQuery(
    undefined,
    { enabled: !!session?.user }
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      void router.push("/auth/signin");
    }
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    await router.push("/");
  };

  if (status === "loading") {
    return (
      <Container className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </Container>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your personal dashboard"
      />

      <Container className="py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">User Profile</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{session.user.name ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm">{session.user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Expires</p>
                <p className="text-sm">{new Date(session.expires).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6">
              <CTA
                onClick={handleSignOut} 
                tone="secondary" 
                fullWidth
                label="Sign Out"
              />
            </div>
          </Card>

          {/* Credits Card */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">AI Credits</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-3xl font-bold text-brand-600">
                  {credits?.balance ?? 0}
                </p>
              </div>
              {subscription?.active && (
                <div>
                  <p className="text-sm text-gray-500">Subscription</p>
                  <p className="font-medium">{subscription.planName}</p>
                  <p className="text-xs text-gray-500">
                    Renews {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-2">
              <CTA
                href="/credits"
                fullWidth
                label="Buy Credits"
              />
              {subscription?.active && (
                <CTA
                  href="/api/billing/portal-link"
                  tone="secondary"
                  fullWidth
                  label="Manage Subscription"
                />
              )}
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="space-y-3">
              <CTA
                href="/profile/edit"
                fullWidth
                tone="secondary"
                label="Edit Profile"
              />
              <CTA
                href="/services"
                fullWidth
                tone="secondary"
                label="View Services"
              />
              <CTA
                href="/contact"
                fullWidth
                tone="secondary"
                label="Contact Support"
              />
            </div>
          </Card>

          {/* Account Status Card */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Account Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email Verified</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  (session.user as unknown as { emailVerified?: string | null }).emailVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {(session.user as unknown as { emailVerified?: string | null }).emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Account Type</span>
                <span className="text-sm font-medium">
                  {subscription?.active ? "Premium" : "Free"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Session Details (for debugging) */}
        <Card className="mt-6 p-6">
          <h2 className="mb-4 text-xl font-semibold">Session Details</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </Card>
      </Container>
    </div>
  );
}
