**Day 1 — 2026-05-06**

**Hours worked:** 5

**What I did:**
- Read the full assignment PDF and mapped out all 6 MVP features plus required documentation
- Chose tech stack: Next.js 14, Tailwind, shadcn/ui, PostgreSQL + Prisma, Resend
- Set up the Next.js project with TypeScript, Tailwind, and shadcn/ui
- Hit Prisma v7 breaking changes, downgraded to v6.19, resolved config conflicts
- Created database schema with Audit and Lead models
- Built pricing data module with all required tools and verified May 2026 pricing
- Built the spend input form with dynamic tool selection and localStorage persistence
- Built the audit API route
- Built the report page with per-tool breakdown, OG tags, and shareable URLs
- Built email capture form and lead capture API

**What I learned:**
- Prisma v7 has breaking changes — downgraded to v6.19 for stability
- Next.js 14 App Router params are Promises that must be awaited
- Server Components can't have onClick — need Client Components for interactivity

**Blockers / what I'm stuck on:**
- Prisma integration took debugging — port mismatches from leftover v7 config file
- shadcn toast deprecation — switched to sonner

**Plan for tomorrow:**
- Write audit engine tests (minimum 5)
- Set up GitHub Actions CI workflow
- Start reaching out for user interviews
- Begin documentation: GTM.md, ECONOMICS.md, REFLECTION.md