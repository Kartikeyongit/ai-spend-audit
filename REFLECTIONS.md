# Reflection

## 1. The Hardest Bug I Hit This Week, and How I Debugged It

The hardest bug was the Prisma "shadow database" port mismatch during initial setup. Running `npx prisma migrate dev` threw: `Can't reach database server at localhost:51214` — but my PostgreSQL was running on port 5432, and I had never configured port 51214 anywhere.

**Hypothesis 1:** My DATABASE_URL had a typo or wrong port. Checked `.env` — correct, port 5432, connection string validated.

**Hypothesis 2:** Prisma was reading a different `.env` file. Checked with `npx prisma validate` — it was loading the right schema and datasource. Not a path issue.

**Hypothesis 3:** Docker or another PostgreSQL instance was running on 51213/51214. Ran `docker ps` — nothing. Ran `netstat -ano | findstr 51213` — no process listening on those ports. Port conflict ruled out.

**Hypothesis 4 — the actual cause:** Prisma v7 had been installed first, created a `prisma.config.ts` with its own URL configuration, and then I downgraded to v6. But Prisma v6 was still detecting and loading the leftover `prisma.config.ts` file, which shadowed the `.env` configuration and used different port numbers for the shadow database feature. The tell was the log line: "Loaded Prisma config from prisma.config.ts" — Prisma v6 should NOT load that file at all, but the file's presence confused it.

**Fix:** Deleted `prisma.config.ts`. Immediately resolved. The lesson: version downgrades leave artifacts. Always check for config files from newer versions. I also learned that Prisma's error messages show you which config source it's loading from ("Loaded Prisma config from...") — that line was the key debugging signal I initially overlooked.

---

## 2. A Decision I Reversed Mid-Week, and What Made Me Reverse It

I originally planned to gate the audit results behind an email capture — show users their savings breakdown only after they entered their email. This is the standard growth play: value in exchange for contact info.

Priya (Interview 2) changed my mind. She said "I don't want another newsletter. I get fifty cold emails a day already." She was firm about it — not hostile, just exhausted by email gates. More importantly, she made me realize that the shareable URL was the actual growth mechanism, not the email database.

If the results are gated, nobody can share them. Raghav (Interview 1) said he'd "screenshot and send to his investor update" — that impulse dies if you have to say "but first, give me your email." The viral loop depends on frictionless sharing.

I reversed the flow: audit results are fully visible before any email ask. The email capture sits below the results as an optional step — "Save your report" or "Get notified about new optimizations." For high-savings audits, the Credex CTA is prominent, but the numbers are public.

This probably costs 20-30% in email capture rate. But it gains in shareability and trust. For a tool whose primary distribution is word-of-mouth, that's the right tradeoff.

---

## 3. What I Would Build in Week 2 If I Had It

**1. API break-even calculator.** Arjun (Interview 3) asked when he should switch from a Claude Pro subscription to API direct. Currently the tool only audits existing spend — it doesn't help users make forward-looking decisions. I'd add "If you send more than X messages/day, API direct becomes cheaper" with a slider for estimated daily usage. This turns the tool from a one-time audit into a decision-making utility.

**2. Team-wide audit (upload CSV or connect billing).** Right now it's manual per-tool entry. The biggest friction point for Priya (Interview 2) was that she didn't know exactly how many seats they had on each tool. Giving users the ability to upload a CSV export from their SaaS management tool (or eventually connect via API to Ramp/Brex) would 10x the accuracy and reduce drop-off.

**3. Historical tracking + alerts.** Users who capture their email should get a quarterly re-audit reminder. Pricing changes constantly (Anthropic just added a Max plan, OpenAI keeps restructuring tiers). A "Your AI spend audit from May 2026 vs today" email would bring users back and re-engage them.

**4. Benchmarking.** Raghav mentioned comparing his spend to "what's normal." Aggregated, anonymized benchmarks ("Teams your size spend $X/dev/month on AI tools on average") would make the audit sticky and shareable — and give Credex proprietary market data.

---

## 4. How I Used AI Tools

**What I used:**
- **Claude (Anthropic API)** — the one AI feature in the product itself: generating the ~100-word audit summary. I chose Claude over GPT-4 because Haiku is fast (<1s), cheap, and followed word-count constraints more precisely in testing.
- **Cursor (Pro)** — my primary IDE for writing TypeScript, Tailwind classes, and Prisma schema. Autocomplete saved time on boilerplate; tab-to-accept for repetitive patterns like shadcn component imports.
- **ChatGPT (Plus)** — used sparingly for rubber-ducking architecture decisions ("what's the tradeoff between Edge Functions and Serverless for this audit engine?"). I didn't use it to generate code blocks — the audit logic is the one thing that had to be 100% my thinking.

**What I didn't trust AI with:**
- **Pricing data.** I pulled every number manually from official vendor pricing pages. LLMs hallucinate prices confidently — I tested this by asking Claude "what's the current Cursor Pro price?" in May 2026 and it returned $20 (correct) but last month it returned $15 (outdated). Can't risk incorrect prices in a tool whose entire value prop is accuracy.
- **Audit engine logic.** The four-pathway evaluation (downgrade, alternative, credits, optimized) was hand-coded. I wanted to understand every branch personally. When I asked an LLM to suggest audit rules, it proposed "Cursor is better than GitHub Copilot for solo devs" — which is an opinion, not a defensible recommendation with numbers.
- **The user interview analysis.** I wrote USER_INTERVIEWS.md from raw notes. AI summaries of conversations strip the specific quotes and surprising contradictions that make interviews credible.

**One specific time AI was wrong and I caught it:**
I asked ChatGPT to generate a unit economics model for the tool. It confidently told me that "a typical lead-gen tool converts at 3-5% from free user to paid" and used that as the basis for the revenue model. But this tool isn't SaaS — it's a lead funnel for a credit marketplace. The conversion rate from "audit completed" to "credit purchase" involves two steps (audit → consultation, consultation → purchase) and each step has its own drop-off. Applying a generic SaaS conversion rate would have overstated revenue by 5x. I built the ECONOMICS.md model from scratch with explicit funnel stages and conservative estimates for each.

---

## 5. Self-Rating (1–10 Scale)

- **Discipline: 8/10** — Started early, pushed commits across 6 calendar days, no cramming. One point off because I underestimated the Prisma setup friction and lost time on Day 1.

- **Code Quality: 7/10** — TypeScript throughout, sensible abstractions (separate files for pricing, engine, email, AI), no god objects. Could improve: deduplicate Prisma client instantiation across routes, add more edge case handling in the form validation.

- **Design Sense: 7/10** — Clean, readable results page with clear information hierarchy (hero number → per-tool breakdown → CTA). Used Tailwind's built-in design tokens consistently. Not a designer — the landing page copy is stronger than the visual design.

- **Problem-Solving: 8/10** — The audit engine's four-pathway logic handles edge cases (Team plan with too few seats, already-optimized stacks, empty tool arrays). The AI summary has graceful fallbacks at every failure point. Could improve: the alternative tool matching is currently limited to one alternative per tool.

- **Entrepreneurial Thinking: 8/10** — The user interviews genuinely changed the product (non-gated results, copy-as-table, API break-even idea). The GTM plan uses specific channels with estimated numbers, not template language. The unit economics acknowledges the two-step funnel and doesn't overstate conversion rates. One point off: I wish I'd talked to 5 users instead of 3.