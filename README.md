# AI Spend Audit

A free tool that audits your AI tool spending and finds real savings opportunities. Built for the Credex Web Development Intern assignment (Round 1).

**Live demo:** [Deploy on Vercel to get your URL]

## What It Does

1. Tell us what AI tools you pay for (Cursor, ChatGPT, Claude, etc.)
2. Get an instant audit showing where you're overspending
3. See total monthly + annual savings
4. Get an AI-generated summary of your audit
5. Share results via a unique public URL

Built as a lead-generation tool for [Credex](https://credex.rocks) — users with significant savings (>$500/month) are offered a Credex consultation for discounted AI infrastructure credits.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Email:** Resend
- **AI:** Anthropic Claude API
- **Testing:** Vitest
- **CI/CD:** GitHub Actions → Vercel

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (local or cloud)
- Anthropic API key (for AI summaries)
- Resend API key (for emails)

### Setup

\`\`\`bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-spend-audit.git
cd ai-spend-audit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, ANTHROPIC_API_KEY, RESEND_API_KEY

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
\`\`\`

### Environment Variables

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_spend_audit"
ANTHROPIC_API_KEY="sk-ant-..."
RESEND_API_KEY="re_..."
\`\`\`

### Running Tests

\`\`\`bash
npm test
\`\`\`

## Project Structure

\`\`\`
src/
  app/
    page.tsx                    # Spend input form
    report/[publicId]/page.tsx  # Audit results page
    api/
      audit/route.ts            # Audit API
      capture/route.ts          # Lead capture API
  lib/
    pricing-data.ts             # All tool pricing (sourced May 2026)
    audit-engine.ts             # Core audit logic
    __tests__/
      audit-engine.test.ts      # 8 tests covering the audit engine
  components/
    share-button.tsx            # Client component for sharing
    ui/                         # shadcn/ui components
prisma/
  schema.prisma                 # Database schema
docs/                           # All assignment documentation
  DEVLOG.md
  ARCHITECTURE.md
  PRICING_DATA.md
  TESTS.md
  REFLECTION.md
  GTM.md
  ECONOMICS.md
  USER_INTERVIEWS.md
  LANDING_COPY.md
  METRICS.md
  PROMPTS.md
\`\`\`

## Key Decisions

1. **Hardcoded audit rules, not AI:** The audit logic uses deterministic rules with cited pricing. An LLM would hallucinate prices and produce indefensible recommendations. AI is used only for the summary paragraph.
2. **PostgreSQL over SQLite:** Needed for production-readiness and concurrent writes. SQLite would work for a prototype but not for a tool Credex could launch.
3. **Server Components for report pages:** Enables dynamic OG tags for social sharing without client-side JavaScript.
4. **publicId over sequential IDs:** Prevents enumeration attacks on audit URLs.
5. **Honeypot over hCaptcha:** No third-party dependency, no UX friction, effective against basic bots.

## License

MIT