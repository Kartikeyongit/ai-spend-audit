# Tests

## Audit Engine Tests

**File:** `src/lib/__tests__/audit-engine.test.ts`
**How to run:** `npm test`

| # | Test Name | What It Covers |
|---|-----------|----------------|
| 1 | Recommend downgrade from Team plan when seats < minimum | Validates that the engine detects when a team plan is overkill for small teams (e.g., 3 users on Claude Team which requires 5 minimum) |
| 2 | Recommend credits when user pays full retail price | Validates that the credit-saving pathway triggers for retail-price subscriptions, offering ~20% savings through Credex |
| 3 | No false savings when already optimized | Validates that the engine doesn't fabricate savings — free tiers and optimal plans return zero savings with `optimized` type |
| 4 | Sum savings across multiple tools correctly | Validates that `totalMonthlySavings` equals the sum of individual recommendations, and `totalAnnualSavings = monthly × 12` |
| 5 | High savings flag triggers at $500/month | Validates the `isHighSavings` boolean threshold that gates the Credex consultation CTA |
| 6 | Low savings doesn't trigger high savings flag | Validates the negative case — savings under $500 should not trigger the consultation CTA |
| 7 | Alternative recommendation for cheaper equivalent | Validates that the engine considers alternative tools (e.g., Windsurf vs Cursor) when applicable |
| 8 | Empty tools array handled gracefully | Validates edge case: no tools submitted returns empty recommendations and zero savings |

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch