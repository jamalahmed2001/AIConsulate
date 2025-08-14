import { type GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format, isToday, isTomorrow, isYesterday, startOfDay, endOfDay } from "date-fns";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { AppointmentCalendar } from "@/components/admin/AppointmentCalendar";

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
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function AdminBookingsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    void loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      // For now, load all appointments for the authenticated user
      // In a real admin interface, you&apos;d load all appointments from all users
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json() as { appointments: Appointment[] };
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === id ? { ...apt, status } : apt
          )
        );
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    
    return format(date, 'EEE, MMM d, h:mm a');
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "text-blue-600 bg-blue-50";
      case "confirmed": return "text-green-600 bg-green-50";
      case "cancelled": return "text-red-600 bg-red-50";
      case "completed": return "text-gray-600 bg-gray-50";
      case "no_show": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
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

  const toggleAppointmentSelection = (appointmentId: string) => {
    setSelectedAppointments(prev =>
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedAppointments.length === 0) return;
    
    try {
      await Promise.all(
        selectedAppointments.map(id => 
          updateAppointmentStatus(id, action)
        )
      );
      setSelectedAppointments([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    // Status filter
    if (filter !== "all" && apt.status !== filter) return false;
    
    // Date filter
    if (dateFilter !== "all") {
      const appointmentDate = new Date(apt.startTime);
      const today = new Date();
      
      switch (dateFilter) {
        case "today":
          if (!isToday(appointmentDate)) return false;
          break;
        case "tomorrow":
          if (!isTomorrow(appointmentDate)) return false;
          break;
        case "this_week":
          const weekStart = startOfDay(today);
          const weekEnd = endOfDay(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000));
          if (appointmentDate < weekStart || appointmentDate > weekEnd) return false;
          break;
      }
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        apt.service.name.toLowerCase().includes(searchLower) ||
        (apt.customerName?.toLowerCase().includes(searchLower) ?? false) ||
        (apt.customerEmail?.toLowerCase().includes(searchLower) ?? false) ||
        (apt.user.name?.toLowerCase().includes(searchLower) ?? false) ||
        (apt.user.email?.toLowerCase().includes(searchLower) ?? false)
      );
    }
    
    return true;
  });

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

  return (
    <Section className="py-12">
        <PageHeader
          title="Booking Management"
          subtitle="Manage and track customer appointments"
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admin" },
            { label: "Bookings" }
          ]}
        />

        <div className="mt-8">
          {/* Enhanced Filter and Search Controls */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold">Appointments</h3>
                <div className="text-sm text-neutral-500">
                  {filteredAppointments.length} of {appointments.length} appointments
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-neutral-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    📋 List
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      viewMode === "calendar"
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    📅 Calendar
                  </button>
                </div>

                <CTA href="/book" size="sm">
                  + New Booking
                </CTA>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "scheduled", label: "Scheduled" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "completed", label: "Completed" },
                    { value: "no_show", label: "No Show" },
                  ]}
                />
              </div>

              <div>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Dates" },
                    { value: "today", label: "Today" },
                    { value: "tomorrow", label: "Tomorrow" },
                    { value: "this_week", label: "This Week" },
                  ]}
                />
              </div>

              <div>
                {selectedAppointments.length > 0 && (
                  <Select
                    value=""
                    onChange={(e) => handleBulkAction(e.target.value)}
                    placeholder={`Bulk Actions (${selectedAppointments.length})`}
                    options={[
                      { value: "confirmed", label: "Mark as Confirmed" },
                      { value: "cancelled", label: "Mark as Cancelled" },
                      { value: "completed", label: "Mark as Completed" },
                    ]}
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Appointments Display */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {searchTerm || filter !== "all" || dateFilter !== "all" 
                    ? "No matching appointments found"
                    : "No appointments yet"
                  }
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  {searchTerm || filter !== "all" || dateFilter !== "all"
                    ? "Try adjusting your search criteria or filters to find what you&apos;re looking for."
                    : "When customers book appointments, they&apos;ll appear here for you to manage."
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <CTA href="/book" size="sm">
                    Create Test Booking
                  </CTA>
                  {(filter !== "all" || dateFilter !== "all" || searchTerm) && (
                    <CTA
                      tone="secondary"
                      size="sm"
                      onClick={() => {
                        setFilter("all");
                        setDateFilter("all");
                        setSearchTerm("");
                      }}
                    >
                      Clear Filters
                    </CTA>
                  )}
                </div>
              </div>
            </Card>
          ) : viewMode === "list" ? (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedAppointments.includes(appointment.id)}
                          onChange={() => toggleAppointmentSelection(appointment.id)}
                          className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Status Icon */}
                      <div className="text-2xl pt-0.5">
                        {getStatusIcon(appointment.status)}
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-900 truncate">
                              {appointment.service.name}
                            </h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status.replace("_", " ").toUpperCase()}
                              </span>
                              <span className="text-sm text-neutral-500">
                                {appointment.service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-neutral-500">
                            <div className="font-medium">{formatDateTime(appointment.startTime)}</div>
                            <div>ID: {appointment.id.slice(-8)}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          {appointment.customerName && (
                            <div>
                              <span className="font-medium text-neutral-700">Customer:</span>
                              <div className="text-neutral-600">{appointment.customerName}</div>
                            </div>
                          )}
                          {appointment.customerEmail && (
                            <div>
                              <span className="font-medium text-neutral-700">Email:</span>
                              <div className="text-neutral-600 truncate">{appointment.customerEmail}</div>
                            </div>
                          )}
                          {appointment.customerPhone && (
                            <div>
                              <span className="font-medium text-neutral-700">Phone:</span>
                              <div className="text-neutral-600">{appointment.customerPhone}</div>
                            </div>
                          )}
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                            <span className="font-medium text-neutral-700 text-sm">Notes:</span>
                            <div className="text-sm text-neutral-600 mt-1">{appointment.notes}</div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {appointment.status === "scheduled" && (
                            <CTA
                              size="sm"
                              tone="primary"
                              onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                            >
                              ✅ Confirm
                            </CTA>
                          )}
                          
                          {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                            <>
                              <CTA
                                size="sm"
                                tone="secondary"
                                onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                              >
                                ✔️ Complete
                              </CTA>
                              <CTA
                                size="sm"
                                tone="ghost"
                                onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                              >
                                ❌ Cancel
                              </CTA>
                            </>
                          )}

                          {appointment.status === "confirmed" && (
                            <CTA
                              size="sm"
                              tone="ghost"
                              onClick={() => updateAppointmentStatus(appointment.id, "no_show")}
                            >
                              👻 No Show
                            </CTA>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Calendar View */
            <AppointmentCalendar 
              appointments={filteredAppointments}
              onAppointmentUpdate={updateAppointmentStatus}
            />
          )}

          {/* Enhanced Summary Stats */}
          {appointments.length > 0 && (
            <div className="mt-12">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {appointments.filter(a => a.status === "scheduled").length}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Scheduled</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-2xl font-bold text-green-600">
                      {appointments.filter(a => a.status === "confirmed").length}
                    </div>
                    <div className="text-sm text-green-700 font-medium">Confirmed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">✔️</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {appointments.filter(a => a.status === "completed").length}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl mb-1">❌</div>
                    <div className="text-2xl font-bold text-red-600">
                      {appointments.filter(a => a.status === "cancelled").length}
                    </div>
                    <div className="text-sm text-red-700 font-medium">Cancelled</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-1">👻</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {appointments.filter(a => a.status === "no_show").length}
                    </div>
                    <div className="text-sm text-orange-700 font-medium">No Show</div>
                  </div>
                </div>
                
                {/* Additional Stats */}
                <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-neutral-900">
                      {appointments.length}
                    </div>
                    <div className="text-sm text-neutral-600">Total Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-neutral-900">
                      {appointments.filter(a => isToday(new Date(a.startTime))).length}
                    </div>
                    <div className="text-sm text-neutral-600">Today&apos;s Appointments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-neutral-900">
                      {Math.round(
                        (appointments.filter(a => a.status === "completed").length / Math.max(appointments.length, 1)) * 100
                      )}%
                    </div>
                    <div className="text-sm text-neutral-600">Completion Rate</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Section>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
