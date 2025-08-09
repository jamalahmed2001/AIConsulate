# AI Consulate Advisory — T3 Stack (Pages Router) · Production README

> **A crisp, iOS‑inspired AI agency starter**: Pages Router + Tailwind + TypeScript (strict) + Prisma/Postgres + NextAuth + tRPC + MDX. Minimal steps, maximal polish. Built to feel like a native iOS 17/18 app—calm surfaces, gentle motion, decisive CTAs.

---

## ✨ Why this exists

Ship a trustworthy AI consultancy site that converts: value props, services, case studies, pricing, blog, and a no‑friction contact flow. All batteries included: security headers, rate limiting, input validation, logs, tests, CI/CD, SEO, analytics.

**Highlights**

* **Modern iOS look & feel**: soft radii, gentle shadows, fluid micro‑interactions, spacious typography.
* **Pages Router UI** with server bits kept stable (migrate deliberately).
* **Type‑safe everywhere**: zod + tRPC + Prisma.
* **MDX content** for blog/case studies with SEO front‑matter.
* **Admin** to review leads & publish content.

---

## 🧱 Tech Stack

* **Next.js** (Pages Router UI in `src/pages`)
* **Tailwind CSS** (forms, typography, line‑clamp, aspect‑ratio)
* **TypeScript** (strict)
* **Prisma + PostgreSQL**
* **NextAuth** (keep existing `src/app/api/auth/[...nextauth]` or migrate later)
* **tRPC** (typed APIs)
* **MDX** (blog/case studies)
* **Optional**: PostHog (analytics), Sentry (errors), Stripe (invoices/engagements)

> **Skill signal**: the stack balances DX (T3) with production posture (headers, CSP, tests, CI, error tracking) without ceremony.

---

## 🚀 Quickstart

```bash
pnpm install
cp .env.example .env  # fill values
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm dev
```

**Required env**

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Analytics/Monitoring (optional)
POSTHOG_KEY=""
SENTRY_DSN=""

# Payments (optional, for deposits/invoices)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 🗂️ Project Layout

```
src/
  pages/                # Pages Router UI
    _app.tsx           # Providers: tRPC, NextAuth, SEO
    index.tsx
    services.tsx
    pricing.tsx
    about.tsx
    contact.tsx
    blog/index.tsx
    blog/[slug].tsx
    case-studies/index.tsx
    case-studies/[slug].tsx
    faq.tsx
    404.tsx
    _error.tsx
    api/
      lead.ts          # Lead POST (zod + rate‑limit)
      trpc/[trpc].ts   # tRPC handler
  components/
    layout/            # Navbar, Footer, SiteLayout
    ui/                # Button, Input, Card, Section, PricingTable, Badge, Prose, etc.
    blocks/            # Hero, FeatureGrid, LogoCloud, Testimonial, CTA, FAQ, Timeline
  server/
    api/               # tRPC routers (lead, posts, caseStudies)
      routers/
    auth/              # NextAuth helpers, role checks
    db.ts              # Prisma client
  hooks/
  utils/
content/
  blog/*.mdx
  case-studies/*.mdx
prisma/
  schema.prisma
```

---

## 🎨 Design Language (iOS‑style)

* **Typography**: Inter (via `next/font`). Generous line height; sizes scale 13/15/18/24/32/44.
* **Radii & elevation**: `rounded-2xl`, soft drop shadows; never harsh borders.
* **Colour**: mostly neutral; one brand hue for CTAs & accents; semantic tokens in Tailwind theme.
* **Motion**: subtle transforms on hover/focus; 150–200ms easing; reduced motion respected.
* **A11y**: visible focus rings, aria labels, proper landmarks; min contrast AA+.

---

## 🧩 Reusable UI (examples)

* **Primitives**: Button, Input, Textarea, Select, Label, Badge, Card, Container, Section, Heading
* **Navigation**: Navbar, MobileNav, Footer
* **Blocks**: Hero, FeatureGrid, LogoCloud, Testimonial, CTA, PricingTable, FAQ, Process/Timeline, Stat, Breadcrumbs, Pagination, Prose (MDX‑styled)

> **Skill signal**: components are headless‑friendly, keyboardable, and themeable.

---

## 📄 Content via MDX

Front‑matter example:

```mdx
---
title: "How we automated inbound qualification with AI"
slug: "ai-inbound-qualification"
excerpt: "We reduced time-to-first-response by 78%."
date: 2024-05-01
tags: [automation, agents]
ogImage: "/og/ai-inbound-qualification.png"
---
```

Pages use `next-mdx-remote` + `getStaticProps`/`getStaticPaths` with Prose styles.

---

## 🗃️ Prisma Models (core)

```prisma
model Lead {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  name      String
  email     String
  company   String?
  budget    String?
  goals     String?
  message   String
  source    String?
  handled   Boolean  @default(false)
}

model Post {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  tags        Tag[]
}

model CaseStudy {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  summary     String?
  published   Boolean  @default(false)
  publishedAt DateTime?
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}
```

Migrate:

```bash
pnpm prisma generate && pnpm prisma migrate dev --name content
```

---

## 🔌 API & tRPC

**Lead API (Pages Router)** — `src/pages/api/lead.ts`

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "~/server/db";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  budget: z.string().optional(),
  goals: z.string().optional(),
  message: z.string().min(10),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  await db.lead.create({ data: parsed.data });
  return res.status(200).json({ ok: true });
}
```

**tRPC routers** — `lead`, `posts`, `caseStudies` with zod; merge in `src/server/api/root.ts` and expose via `src/pages/api/trpc/[trpc].ts`.

---

## 🔐 Auth & Admin

* **NextAuth** (keep existing App Router route or migrate to `src/pages/api/auth/[...nextauth].ts`).
* `User.role` → gate `/admin` (review leads, publish posts/case studies).

---

## 🧭 SEO & Performance

* `next-seo` defaults in `src/seo.config.ts`:

```ts
import type { DefaultSeoProps } from "next-seo";
export const defaultSEO: DefaultSeoProps = {
  titleTemplate: "%s | AI Consulate Advisory",
  defaultTitle: "AI Consulate Advisory",
  description: "Strategy, automation, and AI agents that ship outcomes.",
  openGraph: { type: "website", site_name: "AI Consulate Advisory", images: [] },
  twitter: { cardType: "summary_large_image" },
};
```

* `next/image`, font optimization, ISR.
* Targets: **Perf ≥ 90**, **A11y ≥ 95**, **Best Practices ≥ 95**, **SEO ≥ 95** (Lighthouse).

---

## 🛡️ Security & Reliability

* **Strict CSP & headers** in `next.config.js` (no inline script; `frame-ancestors 'none'`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; lean `Permissions-Policy`).
* **Validation**: zod on all inputs (client + server).
* **Rate limiting**: basic token‑bucket on `/api/lead` (use Upstash or in‑memory dev).
* **Cookies**: secure, HTTPOnly, SameSite=lax; HTTPS in prod.
* **Observability**: Sentry for errors; request logging at edge.

---

## 🧪 Testing & QA

* **Unit**: Vitest for components/utils.
* **E2E**: Playwright for critical flows (home render, contact submit, blog/case study view).
* **Scripts**:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build && pnpm start
```

---

## 🤖 CI/CD (GitHub Actions)

* On PR: install → typecheck → lint → test → build.
* On merge to `main`: deploy to Vercel.

---

## ☁️ Deployment (Vercel)

* Add env vars in Vercel.
* `pnpm prisma migrate deploy` during build.
* Configure image domains + headers in `next.config.js`.

---

## 🧭 UX Flow (low friction)

1. Land → **Hero** with tight value prop + social proof (logo cloud, metric).
2. Skim **Services**; each card links to concise details.
3. See **Case Studies** (problem → approach → outcome with concrete metrics).
4. **Pricing** with 2–3 packages + custom CTA.
5. **Contact**: tiny form (name, email, goals, message). Optional scheduling link.

> **Principle**: progressive disclosure, one clear CTA per view, zero dead ends.

---

## 🧭 Optional Commerce‑adjacent Bits (tastefully integrated)

* Stripe‑powered deposits/invoices for engagements (no full cart flows).
* Referral codes in lead source (attribute marketing without adding friction).

---

## ✅ Acceptance Checklist

* Consistent branding, colour tokens, and type scale.
* Security headers + CSP active in prod.
* Client/server validation; abuse protection on forms.
* Sitemap, robots, OpenGraph, favicon, social preview complete.
* MDX blog & case studies render with correct SEO (JSON‑LD).
* Admin routes fully gated; unauthorized blocked.
* CI & tests green; production build clean.

---

## 🧭 Commands (pnpm only)

* `pnpm dev` — run locally
* `pnpm build` / `pnpm start` — production build/run
* `pnpm prisma generate` / `pnpm prisma migrate dev` — DB
* `pnpm lint` / `pnpm format:write` / `pnpm test` — quality

---

## 📎 Notes on Maintainability

* Descriptive names; no cryptic abbreviations. Functions = verbs; variables = clear nouns.
* Small, composable components; colocate hooks; document the non‑obvious.
* Keep server boundaries clear; move slowly when migrating auth routes.

> **Subtle portfolio flex**: This README demonstrates judgment—security posture, DX, and UX standards—without shouting.
