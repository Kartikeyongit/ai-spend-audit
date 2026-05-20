# feat: add re-audit on pricing change with email notifications

## What this PR does
Adds a system that detects when AI tool pricing changes, notifies affected users via email, and lets them re-run their audit to see a side-by-side diff of old vs new recommendations. The detect-changes endpoint compares stored pricing snapshots against current pricing and groups affected users for consolidated email notifications.

## Why
Pricing for AI tools changes frequently — Cursor raised prices in 2024, Claude added new tiers in 2025, Copilot restructured plans. A one-time audit becomes stale within weeks. Users who captured their email expecting to save money would never know their recommendations are outdated. This feature keeps audits alive and builds trust by proactively notifying users when their savings estimates might have changed.

## How it works
1. Every audit now stores a `pricingSnapshot` (full copy of pricing data at creation time) and the user's email
2. `POST /api/detect-changes` compares all stored snapshots against current pricing in `pricing-data.ts`. Accepts optional JSON body for manual testing: `{ tool, plan, newPrice }`
3. Affected audits are grouped by email — one consolidated email per user
4. Email contains: what changed (specific tools and prices), link to re-run
5. Re-audit page (`/reaudit/[publicId]/diff`) auto-calls `/api/reaudit`, which runs the audit engine with current pricing and returns a diff
6. Diff view shows old vs new recommendations side-by-side, with changed items highlighted in yellow and unchanged items muted

**Data flow:** Form submit → Audit saved with snapshot → Pricing changes → POST /api/detect-changes → Emails sent → User clicks link → Diff page → POST /api/reaudit → Old vs new comparison rendered

## What I cut
- **Scheduled/cron trigger.** Manual endpoint is faster to build and test. In production, this would be a Vercel Cron job or GitHub Actions scheduled workflow hitting the endpoint daily. The endpoint is designed to be cron-ready — no change needed to switch from manual to automated.
- **Unsubscribe links in emails.** The Resend template includes a note that users were emailed because they captured their audit, but a one-click unsubscribe (storing opt-out in the Lead table) was deprioritized in favor of the diff view. Would add next.
- **"What changed in AI tooling" public page.** Bonus feature — a marketing surface showing pricing changes regardless of stored audits. Valuable for SEO and organic traffic, but not core to the re-audit flow.
- **Admin dashboard.** Stored audits count, emails sent, and click-through tracking would be useful operationally but didn't affect the user-facing feature.

## How to test it manually
1. Submit an audit with Cursor Pro at $20/month (2 seats). Capture your email on the results page.
2. Hit `POST /api/detect-changes` with body: `{ "tool": "Cursor", "plan": "Pro", "newPrice": 25 }`
3. Check your inbox — you should receive a re-audit email listing the Cursor Pro price change ($20 → $25)
4. Click the "Re-run audit" link in the email
5. You should see the diff view: original audit vs new audit, with Cursor Pro's recommendation updated
6. Verify the savings delta at the top shows the difference

## What's tested
- Audit creation now includes `pricingSnapshot` in the database row
- `detectPricingChanges()` correctly identifies price changes, plan additions, and plan removals
- `getAffectedAudits()` filters audits by affected tools
- `/api/detect-changes` returns correct change detection and affected audit count
- `/api/reaudit` returns valid diff with old and new recommendations
- Email sends without errors (manual verification via Resend logs)