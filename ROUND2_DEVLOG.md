# Round 2 Dev Log

## 2026-05-20 10:15 — Start
Received Round 2 assignment. Read full document. Top 100 out of 13,000. 36 hours. Planning first.

## 2026-05-20 10:35 — Architecture plan
Decided: manual detect-changes endpoint (not cron), stacked diff view (not side-by-side), pricing changes via JSON body for testing. Documented decisions in plan.

## 2026-05-20 11:00 — Schema migration
Added `pricingSnapshot` (JSON) and `status` fields to Audit model. Ran `prisma migrate dev`. Updated audit API to store snapshot on creation. Schema changes work locally.

## 2026-05-20 11:45 — Pricing diff engine
Built `pricing-diff.ts` — compares old pricing snapshots against current `pricing-data.ts`. Handles: price changes, plan additions, plan removals, new tools. Tested with 3 scenarios.

## 2026-05-20 12:30 — Detect changes endpoint
Created `/api/detect-changes` — fetches all active audits with emails, detects pricing changes, groups by user, sends consolidated emails. Supports manual test payload for easy verification.

## 2026-05-20 13:15 — Re-audit email template
Built HTML email template in `email-reaudit.ts`. Shows what changed, which audits are affected, clickable re-run links. One email per user consolidating all their affected audits.

## 2026-05-20 14:00 — Lunch break (45 min)
Ate. Thought about diff view approach. Stacked cards with yellow highlights for changes — faster to build than side-by-side.

## 2026-05-20 14:45 — Re-audit API
Created `/api/reaudit` — runs audit engine with current pricing, builds diff between old and new recommendations, returns delta. Stores updated audit with new pricing snapshot.

## 2026-05-20 15:30 — Diff view page
Built client-side diff view at `/reaudit/[publicId]/diff`. Auto-runs re-audit on load. Shows: savings delta hero, changed items (yellow highlight, side-by-side old/new cards), unchanged items (muted, collapsed). Added loading spinner and error state.

## 2026-05-20 16:30 — End-to-end test
Tested full flow locally: submit audit → capture email → trigger pricing change → receive email → click link → see diff. Works end-to-end.

## 2026-05-20 17:00 — Documentation
Writing ROUND2_PR.md, ROUND2_DEVLOG.md, ROUND2_REFLECTION.md. PR description structured per requirements.

## 2026-05-20 18:00 — Pushed to GitHub
Created `round-2-reaudit` branch, committed all changes, pushed. PR opened but not merged.

## 2026-05-20 18:30 — Deployed to Vercel
Updated environment variables for production Supabase. Redeployed. Testing production flow.

## 2026-05-20 19:00 — Debugging production
Supabase connection issue — same PgBouncer prepared statement error from Round 1. Applied same fix (`pgbouncer=true&connection_limit=1`). Resolved.

## 2026-05-20 19:30 — Production verified
Full flow works on Vercel deployment. Submit → email → re-audit → diff view. All 4 required features working.

## 2026-05-20 20:00 — Final review
Reviewed PR description, checked git history (conventional commits), verified all files at repo root. Ready to submit.

## 2026-05-20 20:30 — Submitted
Form submitted. Done.