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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
