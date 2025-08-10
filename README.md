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





------------------------------------------------------------------------------------------------------------------------------------------------------


# What you’re building (as a separate OSS module)

**`entitlements-service`** — one tiny service that does four things flawlessly:

1. **Auth** (extension ↔ backend)
2. **Subscriptions** (Stripe/Paddle/Lemon Squeezy)
3. **Credits** (prepaid packs + metered usage)
4. **Entitlements API** (read balance, spend, grant, revoke, receipts)

Chrome Web Store payments are dead. Period. Build your own. ([Chrome for Developers][1], [Google Groups][2])

---

## Payments stack (pick one, don’t be cute)

* **Stripe Billing (recommended)**: best dev UX, supports **usage-based meters** + subscriptions + one-off credit packs. You push **meter events** via API/webhooks. ([Stripe Docs][3])
* **Paddle** or **Lemon Squeezy** if you want a Merchant-of-Record to handle EU VAT/Sales tax for you. They own tax + invoicing hell. ([Paddle][4], [Lemon Squeezy Docs][5])

**Rule:** your extension never touches secrets. All payment actions go through your backend’s Checkout/Portal links.

---

## Chrome extension auth that actually works

* MV3 extension uses **`chrome.identity.launchWebAuthFlow`** to do OAuth in a popup to *your* domain (PKCE; no client secret in the extension). Works across Chromium browsers; don’t rely on `getAuthToken`. ([Chrome for Developers][6], [MDN Web Docs][7])
* PKCE is non-optional for a public client. Do it. ([authgear.com][8])

**Flow**

1. Extension opens `/auth/start` → your server generates PKCE + state.
2. User signs in (Google OIDC or email link).
3. Server mints a **short-lived JWT access token** (5–15 min) + **refresh token** bound to the extension install.
4. Extension stores **access token** only; when it expires, call `/auth/refresh` (refresh lives in HttpOnly cookie or device-bound token—do **not** drop it in localStorage).

---

## Entitlements model (subscriptions + credits)

* **Subscriptions** unlock features/quotas per period (monthly cap, “Pro features”).
* **Credits** are a **ledger** (integer units) consumed by your voice calls or API usage.
* **Metered** plans (Stripe Meters) if you price by minutes/tokens—server sends usage events.

**Never trust the client for spending.** The **server that runs the voice call** should be the one to charge credits / emit meter events.

---

## Minimal schema (Postgres)

Keep it explicit and auditable:

```
users(id, email, google_sub, created_at)

customers(id, user_id, provider, provider_customer_id, created_at)

products(id, code, name)
prices(id, product_id, provider, provider_price_id, interval, currency, unit_amount, metered boolean)

subscriptions(id, user_id, provider_subscription_id, status, current_period_end, plan_code, quantity, created_at, updated_at)

credit_ledger(id, user_id, delta, currency, reason, source_ref, created_at)
-- sum(delta) is balance. never UPDATE balances; append-only.

usage_events(id, user_id, meter_code, quantity, ts, ext_event_id UNIQUE, idempotency_key UNIQUE)

installations(id, extension_id, instance_id, user_id NULL, first_seen, last_seen, revoked boolean)

api_tokens(id, user_id, install_id, scope, expires_at, revoked_at, jti UNIQUE)
```

Materialize read models if you need fast `balance` or `minutes_used_this_period`.

---

## API (boring, versioned)

* `POST /auth/start` → returns {authUrl, codeVerifier, state}
* `POST /auth/callback` → returns {accessToken, refreshCookie}
* `GET  /me/entitlements` → {plans\[], features\[], creditBalance, periodUsage}
* `POST /credits/spend` → {amount, feature, idempotencyKey} → {newBalance}
* `POST /credits/grant` (admin/webhook only)
* `POST /meters/event` (server-to-server only)
* `GET  /billing/portal-link` (returns Stripe/Paddle/Lemon portal URL)
* `POST /webhooks/stripe|paddle|lemonsqueezy`

**Idempotency** on every write. If you skip this, you’ll double-charge when a tab retries.

---

## Chrome extension side (MV3)

* On install → create **installation id** (UUID), register with `/installations/register`.
* On popup open → call `/me/entitlements` to show **balance + plan**.
* **Spend** never happens from the extension. Only your **voice backend** spends.

**Auth snippet (outline)**

```ts
const redirectUri = chrome.identity.getRedirectURL('oauth2');
const authUrl = await fetchJSON('/auth/start?redirect_uri=' + encodeURIComponent(redirectUri));
const respUrl = await chrome.identity.launchWebAuthFlow({ url: authUrl.url, interactive: true });
// Parse code, state; POST to /auth/callback
// Store accessToken in memory; refresh via backend when needed
```

Docs you should actually read before typing: Chrome identity & OAuth guides. ([Chrome for Developers][6])

---

## Usage + credits: how to meter without getting robbed

**For the voice calls your extensions trigger:**

* **Server** calculates spend from *actual* resources used (e.g., ASR seconds + TTS characters).
* For per-minute billing: emit meter events or decrement credits **every 5–10 s** (“heartbeats”).
* Maintain a **reservation** model: on call start, soft-reserve N credits; on end, reconcile to actual usage; release or top-up as needed.
* Stripe Meters: define `meter: ai_minutes` (or tokens), then `POST meter events` with `{customer, value, ts}`. ([Stripe Docs][3])

---

## Webhooks (the only source of truth for billing state)

**Stripe**: handle `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`. Update `subscriptions` and **append** a ledger grant when someone buys a credit pack. (Stripe processes meter events async—don’t expect instant dashboard totals.) ([Stripe Docs][9])

**Paddle/Lemon Squeezy**: similar events, plus they handle **VAT/Sales tax** as MoR if you don’t want to touch tax at all. ([Paddle][4], [Lemon Squeezy Docs][5])

---

## Anti-abuse (don’t be a pushover)

* **Bind tokens to installation** (store install\_id in JWT; reject if it doesn’t match).
* **Replay protection** (JWT `jti`, 5–15 min TTL, revoke list in Redis).
* **Rate limit** by user + install + IP (sliding window).
* **Offline grace**: cache entitlements in the extension; allow 15 minutes of cached access then hard-fail.
* **Chargeback quarantine**: auto-revoke entitlements if provider flags fraud.

---

## UX that doesn’t suck

* **One “Manage plan” button** opens customer portal.
* **Unified balance** across all your extensions (per-feature quotas shown per extension).
* **Receipts** downloadable from portal.
* **Free tier** with tiny credit drip daily—market, not charity.

---

## Mapping to your voice stack

* Keep **credits** in the entitlements service, not in the call service.
* The **voice service** sends `SpendRequest(user, feature, amount, idempotencyKey)` to entitlements every heartbeat; on deny, it **ducks** TTS and says “out of credits” (or ends the call).
* For subscriptions with caps (e.g., 300 min/month), you don’t need credits—use **metered usage** only; for hybrid (sub + overage), keep both.

---

## Compliance / boring but mandatory

* If you sell globally and don’t want to be the Merchant of Record, use **Paddle**/**Lemon Squeezy** (they handle VAT/GST/Sales Tax). If you go **Stripe**, you own taxes (Stripe Tax can help, still your liability). ([Paddle][4])
* Chrome Web Store **Licensing API is deprecated**; do **not** build on it. ([Chrome Developers][10])

---

## Acceptance tests (ship with these)

* **Idempotent spend:** 10 parallel `spend(1)` calls with same idempotency key → balance decrements **once**.
* **Race:** spend while webhook downgrades subscription → allow up to grace window, then deny.
* **Retry storms:** drop DB mid-purchase; reconcile from webhooks without double-grant.
* **Cross-device:** two installs race spending from same account; totals correct.
* **Portal flow:** cancel, pause, upgrade, proration reflected within 60 s.

---

## Deliverables (MVP you actually need)

* **Service:** Go or TypeScript (Nest/Fastify), Postgres + Redis.
* **Adapters:** `payments/stripe|paddle|lemonsqueezy.ts`.
* **CLI:** `grants add --user X --credits 1000 --reason promo`.
* **SDKs:** tiny JS client for MV3 + server-side Node/Go client.
* **Examples:** MV3 extension with login, balance UI, “Buy credits”, and “Manage plan”.

---
