import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/server/db";
import { sendLeadNotification } from "@/server/email";

// naive in-memory rate limiter (per-process)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // per IP per window

function getClientIp(req: NextApiRequest): string {
  const xfwd = (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim();
  return xfwd ?? req.socket.remoteAddress ?? "unknown";
}

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  budget: z.string().optional(),
  goals: z.string().optional(),
  message: z.string().min(10),
  source: z.string().optional(),
  // spam/metadata
  website: z.string().optional(), // honeypot
  submittedAt: z.coerce.date().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  pagePath: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const bucket = requestCounts.get(ip);
    if (!bucket || now > bucket.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      if (bucket.count >= MAX_REQUESTS) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
        res.setHeader("Retry-After", retryAfter.toString());
        return res.status(429).json({ error: "Too many requests" });
      }
      bucket.count += 1;
    }

    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.flatten() });

    const { website, submittedAt, ...data } = parsed.data;

    // silently drop obvious spam
    const isSpamHoneypot = website && website.trim().length > 0;
    const isSpamTiming = submittedAt
      ? Date.now() - submittedAt.getTime() < 3000
      : false;

    if (isSpamHoneypot || isSpamTiming) {
      return res.status(200).json({ ok: true });
    }

    const referrer = typeof req.headers.referer === "string" ? req.headers.referer : undefined;
    const userAgent = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined;

    await db.lead.create({
      data: {
        ...data,
        source: data.source ?? "contact",
        referrer,
        userAgent,
        submittedAt: submittedAt ?? new Date(),
      },
    });

    // Best-effort email notification; do not fail the request if email sending fails
    try {
      await sendLeadNotification({ ...data });
    } catch (err) {
      console.error("sendLeadNotification error", err);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("/api/lead error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
