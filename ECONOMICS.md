# Unit Economics

## What's a Converted Lead Worth to Credex?

**Assumption:** Credex sells AI credits at a 15-30% margin. Average deal size for a startup spending $2,000/month on AI tools = $24,000/year in credits purchased.

- Credex margin per deal: 20% × $24,000 = **$4,800/year**
- Average customer lifetime: 18 months (startups churn or grow)
- **LTV per converted lead: ~$7,200**

Conservative estimate: if Credex captures 15% margin on a $1,000/month spend over 12 months = **$1,800 LTV.** We'll use this lower bound.

---

## Customer Acquisition Cost (CAC) by Channel

| Channel | Monthly Effort | Est. Audits | Est. Leads | Est. Conversions | Est. Cost | CAC |
|---------|---------------|-------------|------------|------------------|-----------|-----|
| Hacker News launch | One-time post | 200-500 | 40-100 | 2-5 | $0 | $0 |
| X/Twitter organic | 30 min/day | 50-80 | 15-30 | 1-3 | $0 | $0 |
| Reddit posts | 2 posts/week | 40-60 | 10-20 | 1-2 | $0 | $0 |
| Direct DMs | 30 min/day | 20-30 | 8-15 | 1-2 | $0 | $0 |
| Newsletter mention | One-time | 200-500 | 40-80 | 3-8 | $0 | $0 |

**Total estimated monthly:** 510-1,170 audits → 113-245 leads → 8-20 Credex consultations → 3-8 credit purchases.

At $0 paid budget, **CAC = $0** (time cost only). The tool is the acquisition channel.

---

## Conversion Funnel

Audit completed (100%) → Email captured (20-40%) → High savings flagged (30% of captures) → Consultation booked (15-25% of high savings) → Credit purchase (40-60% of consultations)

**Math for 1,000 audits:**
- 300 emails captured (30%)
- 90 high-savings audits flagged
- 18 consultations booked (20%)
- 9 credit purchases (50%)

At $1,800 LTV per customer: **9 × $1,800 = $16,200 in revenue from 1,000 audits.**

At $7,200 upper-bound LTV: **9 × $7,200 = $64,800.**

---

## Path to $1M ARR in 18 Months

**What would have to be true:**

1. **Volume:** 5,000 audits/month by Month 6, growing to 15,000/month by Month 18
   - Requires consistent organic distribution + 1-2 viral moments (HN front page, major newsletter feature)

2. **Conversion:** 0.5-1% audit-to-purchase rate (currently modeled at 0.9%)
   - Requires the audit engine to maintain credibility — no false savings, defensible reasoning

3. **Deal size:** Average credit purchase of $2,000/month ($24,000/year) with 18-month retention
   - LTV: $7,200 per customer

4. **Math check:**
   - 15,000 audits/month × 0.9% conversion = 135 new customers/month
   - 135 × $7,200 LTV = $972,000 in new LTV per month
   - Month 18 cumulative customers: ~1,600
   - At steady state with 80% retention: ~1,280 active customers × $600/month avg revenue = **$768,000 MRR = $9.2M ARR**

At the lower bound ($1,800 LTV, 0.5% conversion):
   - 15,000 audits × 0.5% = 75 customers/month
   - 75 × $1,800 = $135,000 new LTV/month
   - Month 18 cumulative: ~900 customers, ~720 active × $150/month = **$108,000 MRR = $1.3M ARR** ✅

The break-even for $1M ARR is achievable if the tool hits even 7,000 audits/month with the lower-bound conversion rate.

---

## Key Assumptions That Could Kill This

1. **Audit credibility erodes** — if users find bad recommendations, they stop sharing, and the viral loop dies
2. **Conversion rate is worse than 0.5%** — if audits don't translate to consultations, the tool is just a free utility with no revenue path
3. **Credex can't onboard fast enough** — if consultation-to-purchase takes 4+ weeks, the funnel leaks
4. **Competitors clone the tool** — the audit logic is defensible but not patentable; speed of distribution matters more than code