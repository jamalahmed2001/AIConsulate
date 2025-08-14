import { type GetServerSideProps } from "next";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";
import { SchemaViewer } from "@/components/admin/SchemaViewer";
import { GoogleCalendarIntegration } from "@/components/admin/GoogleCalendarIntegration";

type AdminView = "overview" | "bookings" | "schema" | "analytics" | "integrations";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [currentView, setCurrentView] = useState<AdminView>("overview");

  if (!session) {
    return (
      <Section className="py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You need to be signed in to access this page.</p>
        </div>
      </Section>
    );
  }

  const adminSections = [
    {
      id: "overview" as AdminView,
      title: "Overview",
      icon: "📊",
      description: "System overview and key metrics",
    },
    {
      id: "bookings" as AdminView,
      title: "Bookings",
      icon: "📅",
      description: "Manage customer appointments",
    },
    {
      id: "integrations" as AdminView,
      title: "Integrations",
      icon: "🔗",
      description: "Google Calendar and other integrations",
    },
    {
      id: "schema" as AdminView,
      title: "Database Schema",
      icon: "🗄️",
      description: "Explore database structure",
    },
    {
      id: "analytics" as AdminView,
      title: "Analytics",
      icon: "📈",
      description: "Performance and usage analytics",
    },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-blue-600">24</div>
          <div className="text-sm text-neutral-600">Total Bookings</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-green-600">156</div>
          <div className="text-sm text-neutral-600">Active Users</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-purple-600">$12,450</div>
          <div className="text-sm text-neutral-600">Revenue (MTD)</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-orange-600">+18%</div>
          <div className="text-sm text-neutral-600">Growth Rate</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CTA 
            href="/admin/bookings" 
            tone="primary" 
            size="sm"
            fullWidth
          >
            📅 View All Bookings
          </CTA>
          <CTA 
            onClick={() => setCurrentView("schema")} 
            tone="secondary" 
            size="sm"
            fullWidth
          >
            🗄️ Explore Database
          </CTA>
          <CTA 
            href="/book" 
            tone="ghost" 
            size="sm"
            fullWidth
          >
            ➕ Create Test Booking
          </CTA>
        </div>
      </Card>

      {/* System Health */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">System Health</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Database Connection</span>
            </div>
            <span className="text-green-600 font-medium">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>API Endpoints</span>
            </div>
            <span className="text-green-600 font-medium">All Operational</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Email Service</span>
            </div>
            <span className="text-yellow-600 font-medium">Limited</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Analytics Dashboard</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-xl font-semibold mb-2">Analytics Coming Soon</h4>
          <p className="text-neutral-600 max-w-md mx-auto">
            Comprehensive analytics and reporting features are in development. 
            This will include booking trends, user engagement, revenue analytics, and more.
          </p>
        </div>
      </Card>
    </div>
  );

  return (
    <Section className="py-12">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage your booking system and monitor performance"
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin" }
        ]}
      />

      <div className="mt-8">
        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 mb-8">
          <div className="flex space-x-8 overflow-x-auto">
            {adminSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentView(section.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  currentView === section.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-neutral-500">{section.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div>
          {currentView === "overview" && renderOverview()}
          {currentView === "bookings" && (
            <Card className="p-6">
              <div className="text-center">
                <CTA href="/admin/bookings" size="lg">
                  📅 Go to Bookings Management
                </CTA>
              </div>
            </Card>
          )}
          {currentView === "integrations" && <GoogleCalendarIntegration />}
          {currentView === "schema" && <SchemaViewer />}
          {currentView === "analytics" && renderAnalytics()}
        </div>
      </div>
    </Section>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
