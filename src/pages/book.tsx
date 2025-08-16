import { type GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
// import { useRouter } from "next/router";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { BookingForm } from "@/components/booking/BookingForm";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";

interface BookingData {
  serviceId: string;
  startTime: Date;
  notes?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export default function BookPage() {
  const { data: session, status } = useSession();
  // const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ id: string; service: { name: string; duration: number }; startTime: string; status: string; notes?: string } | null>(null);

  const handleBookingSubmit = async (bookingData: BookingData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error ?? "Failed to create booking");
      }

      const result = await response.json() as { appointment: typeof bookingDetails };
      setBookingDetails(result.appointment);
      setBookingSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <Section className="py-20">
        <PageHeader
          title="Book a Session"
          subtitle="Please sign in to book a consultation session"
        />
        <div className="max-w-md mx-auto mt-8">
          <Card className="text-center">
            <h3 className="text-lg font-semibold mb-4">Authentication Required</h3>
            <p className="text-neutral-600 mb-6">
              You need to be signed in to book a session. This helps us manage your appointments and send you confirmations.
            </p>
            <div className="space-y-3">
              <CTA href="/auth/signin" fullWidth>
                Sign In
              </CTA>
              <CTA href="/auth/signup" tone="secondary" fullWidth>
                Create Account
              </CTA>
            </div>
          </Card>
        </div>
      </Section>
    );
  }

  if (bookingSuccess) {
    return (
      <Section className="py-20">
        <PageHeader
          title="Booking Confirmed!"
          subtitle="Your session has been successfully scheduled"
        />
        
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Session Booked!</h2>
              <p className="text-neutral-600">
                We&apos;ve sent a confirmation email with all the details.
              </p>
            </div>
            
            {bookingDetails && (
              <div className="bg-neutral-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold mb-3">Booking Details:</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Service:</strong> {bookingDetails.service.name}</div>
                  <div><strong>Date & Time:</strong> {formatDateTime(bookingDetails.startTime)}</div>
                  <div><strong>Duration:</strong> {bookingDetails.service.duration} minutes</div>
                  <div><strong>Status:</strong> <span className="capitalize">{bookingDetails.status}</span></div>
                  {bookingDetails.notes && (
                    <div><strong>Notes:</strong> {bookingDetails.notes}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <CTA href="/dashboard" fullWidth>
                View My Bookings
              </CTA>
              <CTA 
                onClick={() => {
                  setBookingSuccess(false);
                  setBookingDetails(null);
                }} 
                tone="secondary" 
                fullWidth
              >
                Book Another Session
              </CTA>
            </div>
          </Card>
        </div>
      </Section>
    );
  }

  return (
    <Section className="py-20">
      <PageHeader
        title="Book a Consultation"
        subtitle="Schedule a personalized session to discuss your AI needs"
      />
      
      <div className="mt-12">
        <BookingForm 
          onSubmit={handleBookingSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      
      {/* Additional info */}
      <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-semibold mb-2">Flexible Scheduling</h3>
          <p className="text-sm text-muted">
            Choose from available time slots that work with your schedule. We offer sessions Monday through Friday.
          </p>
        </Card>
        
        <Card>
          <h3 className="font-semibold mb-2">Personalized Discussion</h3>
          <p className="text-sm text-muted">
            Each session is tailored to your specific needs, challenges, and goals with AI implementation.
          </p>
        </Card>
        
        <Card>
          <h3 className="font-semibold mb-2">Expert Guidance</h3>
          <p className="text-sm text-muted">
            Get actionable insights and recommendations from experienced AI consultants and developers.
          </p>
        </Card>
      </div>
    </Section>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
