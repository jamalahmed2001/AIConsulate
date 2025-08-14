import nodemailer from "nodemailer";
import { env } from "@/env.js";

type LeadPayload = {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  goals?: string;
  message: string;
  source?: string;
};

type BookingConfirmationPayload = {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  notes?: string;
  bookingId: string;
};

function createTransporter() {
  const portNumber = Number(env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: portNumber,
    secure: portNumber === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });
}

export async function sendLeadNotification(data: LeadPayload): Promise<void> {
  // If SMTP or recipient not configured, skip silently in non-production
  if (!env.CONTACT_RECIPIENT || !env.SMTP_HOST || !env.SMTP_PORT) {
    return;
  }
  const transporter = createTransporter();
  const subject = `New contact form submission${data.source ? ` (${data.source})` : ""}`;

  const text = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company ? `Company: ${data.company}` : undefined,
    data.budget ? `Budget: ${data.budget}` : undefined,
    data.goals ? `Goals: ${data.goals}` : undefined,
    "",
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin:0 0 12px;">New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ""}
      ${data.budget ? `<p><strong>Budget:</strong> ${escapeHtml(data.budget)}</p>` : ""}
      ${data.goals ? `<p><strong>Goals:</strong> ${escapeHtml(data.goals)}</p>` : ""}
      <hr style="margin:16px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
    </div>
  `;

  await transporter.sendMail({
    to: env.CONTACT_RECIPIENT,
    from: env.SMTP_USER ?? env.CONTACT_RECIPIENT,
    replyTo: data.email,
    subject,
    text,
    html,
  });
}

export async function sendBookingConfirmation(data: BookingConfirmationPayload): Promise<void> {
  // If SMTP not configured, skip silently in non-production
  if (!env.SMTP_HOST || !env.SMTP_PORT) {
    return;
  }

  const transporter = createTransporter();
  const subject = `Booking Confirmation - ${data.serviceName}`;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const text = [
    `Hi ${data.customerName},`,
    "",
    `Your appointment has been confirmed!`,
    "",
    `Service: ${data.serviceName}`,
    `Date & Time: ${formatDate(data.startTime)}`,
    `Duration: ${data.duration} minutes`,
    data.notes ? `Notes: ${data.notes}` : undefined,
    "",
    `We'll send you a reminder 24 hours before your appointment.`,
    "",
    `If you need to reschedule or cancel, please contact us as soon as possible.`,
    "",
    `Best regards,`,
    `AI Consulate Team`
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a202c; margin: 0;">Booking Confirmed!</h1>
      </div>
      
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin: 0 0 15px;">Hi ${escapeHtml(data.customerName)},</h2>
        <p style="margin: 0 0 15px;">Your appointment has been confirmed! Here are the details:</p>
        
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #4299e1;">
          <p style="margin: 0 0 8px;"><strong>Service:</strong> ${escapeHtml(data.serviceName)}</p>
          <p style="margin: 0 0 8px;"><strong>Date & Time:</strong> ${escapeHtml(formatDate(data.startTime))}</p>
          <p style="margin: 0 0 8px;"><strong>Duration:</strong> ${data.duration} minutes</p>
          ${data.notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${escapeHtml(data.notes)}</p>` : ""}
        </div>
      </div>
      
      <div style="margin: 25px 0;">
        <p style="margin: 0 0 10px;">We'll send you a reminder 24 hours before your appointment.</p>
        <p style="margin: 0;">If you need to reschedule or cancel, please contact us as soon as possible.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #718096; font-size: 14px;">
          Best regards,<br>
          <strong>AI Consulate Team</strong>
        </p>
      </div>
    </div>
  `;

  // Send to customer
  await transporter.sendMail({
    to: data.customerEmail,
    from: env.SMTP_USER ?? env.CONTACT_RECIPIENT,
    subject,
    text,
    html,
  });

  // Send notification to admin if configured
  if (env.CONTACT_RECIPIENT) {
    const adminSubject = `New Booking: ${data.serviceName}`;
    const adminText = [
      `New booking confirmed:`,
      "",
      `Customer: ${data.customerName} (${data.customerEmail})`,
      `Service: ${data.serviceName}`,
      `Date & Time: ${formatDate(data.startTime)}`,
      `Duration: ${data.duration} minutes`,
      `Booking ID: ${data.bookingId}`,
      data.notes ? `Notes: ${data.notes}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    const adminHtml = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin:0 0 12px;">New Booking Confirmed</h2>
        <p><strong>Customer:</strong> ${escapeHtml(data.customerName)} (${escapeHtml(data.customerEmail)})</p>
        <p><strong>Service:</strong> ${escapeHtml(data.serviceName)}</p>
        <p><strong>Date & Time:</strong> ${escapeHtml(formatDate(data.startTime))}</p>
        <p><strong>Duration:</strong> ${data.duration} minutes</p>
        <p><strong>Booking ID:</strong> ${escapeHtml(data.bookingId)}</p>
        ${data.notes ? `<hr style="margin:16px 0;" /><p><strong>Notes:</strong></p><p style="white-space: pre-wrap;">${escapeHtml(data.notes)}</p>` : ""}
      </div>
    `;

    await transporter.sendMail({
      to: env.CONTACT_RECIPIENT,
      from: env.SMTP_USER ?? env.CONTACT_RECIPIENT,
      subject: adminSubject,
      text: adminText,
      html: adminHtml,
    });
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
