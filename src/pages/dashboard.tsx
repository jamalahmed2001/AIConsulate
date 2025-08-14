import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { CTA } from "@/components/ui/CTA";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/utils/api";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  service: {
    id: string;
    name: string;
    duration: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  
  // Fetch user's credits and subscription
  const { data: credits } = api.entitlements.getCredits.useQuery(
    undefined,
    { enabled: !!session?.user }
  );
  
  const { data: subscription } = api.entitlements.getSubscription.useQuery(
    undefined,
    { enabled: !!session?.user }
  );

  const loadUserAppointments = useCallback(async () => {
    if (!session?.user) return;
    
    setLoadingAppointments(true);
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json() as { appointments: Appointment[] };
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      void router.push("/auth/signin");
    } else {
      void loadUserAppointments();
    }
  }, [session, status, router, loadUserAppointments]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    await router.push("/");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "text-blue-700 bg-blue-50 border-blue-200";
      case "confirmed": return "text-green-700 bg-green-50 border-green-200";
      case "cancelled": return "text-red-700 bg-red-50 border-red-200";
      case "completed": return "text-gray-700 bg-gray-50 border-gray-200";
      case "no_show": return "text-orange-700 bg-orange-50 border-orange-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return "📅";
      case "confirmed": return "✅";
      case "cancelled": return "❌";
      case "completed": return "✔️";
      case "no_show": return "👻";
      default: return "❓";
    }
  };

  // Get upcoming and recent appointments
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.startTime) >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const recentAppointments = appointments
    .filter(apt => new Date(apt.startTime) < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 3);

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
                <p className="text-sm text-gray-500">Total Appointments</p>
                <p className="font-medium">{appointments.length}</p>
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
                href="/book"
                fullWidth
                label="Book New Session"
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

        {/* Appointments Section */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Upcoming Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <span className="text-sm text-gray-500">
                {upcomingAppointments.length} of {appointments.filter(apt => new Date(apt.startTime) >= now).length}
              </span>
            </div>
            
            {loadingAppointments ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <CTA href="/book" size="sm">
                  Book Your First Session
                </CTA>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-3 ${getStatusColor(appointment.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getStatusIcon(appointment.status)}</span>
                          <h3 className="font-medium text-sm">{appointment.service.name}</h3>
                        </div>
                        <p className="text-xs opacity-75">{formatDateTime(appointment.startTime)}</p>
                        <p className="text-xs opacity-75">{appointment.service.duration} minutes</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50 border">
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {appointments.filter(apt => new Date(apt.startTime) >= now).length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      +{appointments.filter(apt => new Date(apt.startTime) >= now).length - 3} more appointments
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Recent Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Appointments</h2>
              <span className="text-sm text-gray-500">
                {recentAppointments.length} of {appointments.filter(apt => new Date(apt.startTime) < now).length}
              </span>
            </div>
            
            {loadingAppointments ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">No past appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-3 ${getStatusColor(appointment.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getStatusIcon(appointment.status)}</span>
                          <h3 className="font-medium text-sm">{appointment.service.name}</h3>
                        </div>
                        <p className="text-xs opacity-75">{formatDateTime(appointment.startTime)}</p>
                        <p className="text-xs opacity-75">{appointment.service.duration} minutes</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/50 border">
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {appointments.filter(apt => new Date(apt.startTime) < now).length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      +{appointments.filter(apt => new Date(apt.startTime) < now).length - 3} more past appointments
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* All Appointments Link */}
        {appointments.length > 0 && (
          <Card className="mt-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">All My Appointments</h3>
                <p className="text-sm text-gray-600">
                  View and manage all your appointments in one place
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-600">{appointments.length}</div>
                  <div className="text-xs text-gray-500">Total Bookings</div>
                </div>
                <CTA href="/admin/bookings" tone="secondary">
                  View All Appointments
                </CTA>
              </div>
            </div>
          </Card>
        )}

        {/* Session Details (for debugging) - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 p-6">
            <h2 className="mb-4 text-xl font-semibold">Session Details (Dev Only)</h2>
            <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </Card>
        )}
      </Container>
    </div>
  );
}
