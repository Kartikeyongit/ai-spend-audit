# Architecture

## System Diagram

```mermaid
flowchart TD
    U[User Browser] -->|1. Submits spend form| F[Spend Input Form]
    F -->|2. POST /api/audit| A[Audit API Route]
    A -->|3. Runs audit engine| E[Audit Engine]
    E -->|4. Reads pricing| P[Pricing Data Module]
    E -->|5. Returns recommendations| A
    A -->|6. Stores audit| DB[(PostgreSQL)]
    A -->|7. Returns publicId| F
    F -->|8. Redirects to| R[/report/:publicId]
    R -->|9. Fetches audit| DB
    R -->|10. Renders results| U

    U -->|11. Submits email| C[Email Capture Form]
    C -->|12. POST /api/capture| L[Lead Capture API]
    L -->|13. Stores lead| DB
    L -->|14. Sends confirmation| EML[Resend Email]

    U -->|15. Shares URL| S[Social Media / Slack]
    S -->|16. OG tags render| R
```

## Data Flow

1. User lands on the form page (`/`) — cold visitor, no login required
2. Form submission → `POST /api/audit` with `tools` array, team size, use case
3. Audit engine evaluates each tool against 4 pathways:
   - **Plan downgrade** (same vendor, cheaper tier)
   - **Alternative tool** (different vendor, similar capability)
   - **Credit savings** (Credex discounted credits)
   - **Already optimized** (no savings found)
4. Results persisted to PostgreSQL with a unique `publicId`
5. User redirected to `/report/:publicId` — server-rendered page with OG tags
6. Email capture (`POST /api/capture`) — stores lead, sends confirmation via Resend
7. Shareable URL — public page strips email/company name, shows only savings data

## Tech Stack & Rationale

| Technology | Why |
|---|---|
| Next.js 14 (App Router) | Server components for OG tags, API routes built-in, Vercel deployment |
| TypeScript | Type safety across the audit engine — critical for pricing math correctness |
| Tailwind CSS + shadcn/ui | Polished UI out of the box, accessible components, fast development |
| PostgreSQL + Prisma | Real relational database for lead storage, Prisma for type-safe queries |
| Vitest | Fast test runner, native ESM support, works with TypeScript |
| Resend | Transactional emails with good free tier (100/day) |
| Sonner | Toast notifications, lighter than alternatives |

## What I'd Change for 10k Audits/Day

- **Add Redis cache for pricing data** — currently read from a static module, but at scale you'd want a cache layer with TTL for pricing freshness
- **Move audit engine to Edge Functions** — reduce latency by running closer to users; the engine is pure computation (no DB reads during execution)
- **Queue email sends** — use a job queue (BullMQ + Redis) instead of sending synchronously in the API route; prevents API timeouts during email provider latency
- **Add a shared Prisma client singleton** — already using one for dev, but production needs connection pooling (PgBouncer or Supabase connection pooler)
- **CDN-cache report pages** — public report pages could be statically generated or ISR-cached with revalidation, since they rarely change after creation
- **Rate limiting with Upstash** — move from honeypot-only abuse protection to proper IP-based + email-based rate limiting
- **Monitoring** — add Sentry for error tracking, Vercel Analytics for performance, and a cron job to verify pricing data freshness weekly
