import Anthropic from "@anthropic-ai/sdk";
import { AuditRecommendation } from "./audit-engine";

// Initialize Anthropic client (lazy — only if API key exists)
let anthropic: Anthropic | null = null;
try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
} catch (e) {
  console.warn("Anthropic client initialization failed:", e);
}

interface SummaryInput {
  tools: Array<{ toolName: string; planName: string; monthlySpend: number; seats: number }>;
  teamSize: number;
  primaryUseCase: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  recommendations: AuditRecommendation[];
}

export async function generateAISummary(input: SummaryInput): Promise<string> {
  // If Anthropic is not configured, return template fallback immediately
  if (!anthropic) {
    return generateTemplateSummary(input);
  }

  try {
    const prompt = buildPrompt(input);

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      temperature: 0.7,
      system: "You are a helpful AI spending analyst. Write concise, specific, and actionable summaries. Never hallucinate prices or make up data. Only reference information provided in the audit.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as any).text)
      .join(" ")
      .trim();

    // Fallback to template if response is too short (API error / empty response)
    if (text.length < 30) {
      return generateTemplateSummary(input);
    }

    return text;
  } catch (error) {
    console.error("Anthropic API error:", error);
    return generateTemplateSummary(input);
  }
}

function buildPrompt(input: SummaryInput): string {
  const toolSummary = input.tools
    .map((t) => `${t.toolName} (${t.planName}): $${t.monthlySpend}/month for ${t.seats} seats`)
    .join("\n");

  const savingsSummary = input.recommendations
    .filter((r) => r.estimatedMonthlySavings > 0)
    .map((r) => `${r.toolName}: Save $${r.estimatedMonthlySavings}/month by ${r.recommendedAction.toLowerCase()}`)
    .join("\n");

  const noSavingsTools = input.recommendations
    .filter((r) => r.estimatedMonthlySavings === 0)
    .map((r) => r.toolName)
    .join(", ");

  return `Write a ~100 word personalized summary of this AI spending audit. Be specific, use actual numbers, and sound like a friendly analyst, not a robot.

Team: ${input.teamSize} people
Primary use case: ${input.primaryUseCase}
Tools analyzed:
${toolSummary}

Total potential savings: $${input.totalMonthlySavings}/month ($${input.totalAnnualSavings}/year)

Savings opportunities:
${savingsSummary || "None — all tools are on optimal plans"}

${noSavingsTools ? `Already optimized: ${noSavingsTools}` : ""}

Guidelines:
- Start with their specific situation (team size, use case, tools)
- Mention the biggest savings opportunity and the total
- If savings > $500/month, emphasize this is significant
- If savings < $100/month, be encouraging but honest
- Never mention "Credex" — this is an objective audit
- Keep it to roughly 100 words`;
}

function generateTemplateSummary(input: SummaryInput): string {
  const { tools, teamSize, primaryUseCase, totalMonthlySavings, totalAnnualSavings, recommendations } = input;

  const savingsRecs = recommendations.filter((r) => r.estimatedMonthlySavings > 0);
  const noSavingsCount = recommendations.filter((r) => r.estimatedMonthlySavings === 0).length;

  if (totalMonthlySavings > 500) {
    return `Your team of ${teamSize} uses ${tools.length} AI tools primarily for ${primaryUseCase}, spending a combined $${tools.reduce((sum, t) => sum + t.monthlySpend, 0)}/month. We found significant savings opportunities totaling $${totalMonthlySavings}/month ($${totalAnnualSavings}/year). The biggest win comes from optimizing your ${savingsRecs[0]?.toolName} subscription — ${savingsRecs[0]?.reasoning.toLowerCase()}. ${
      savingsRecs.length > 1 ? `Additionally, we identified savings on ${savingsRecs.length - 1} other tool${savingsRecs.length - 1 > 1 ? "s" : ""}. ` : ""
    }These savings are material enough to fund additional tools or headcount. We recommend reviewing your stack quarterly as pricing evolves.`;
  } else if (totalMonthlySavings > 0) {
    return `Your team of ${teamSize} runs ${tools.length} AI tools focused on ${primaryUseCase}. We identified modest savings of $${totalMonthlySavings}/month ($${totalAnnualSavings}/year) — not transformative, but worth capturing. ${savingsRecs.length > 0 ? `The primary opportunity is ${savingsRecs[0]?.reasoning.toLowerCase()}` : ""} ${
      noSavingsCount > 0 ? `${noSavingsCount} tool${noSavingsCount > 1 ? "s are" : " is"} already on optimal plans. ` : ""
    }Small optimizations compound — even $${totalMonthlySavings}/month covers a team lunch or a side-project tool.`;
  } else {
    return `Your team of ${teamSize} is running a tight ship on AI tool spending. All ${tools.length} tools for ${primaryUseCase} appear to be on appropriate plans for your usage pattern. This is uncommon — most teams we audit have at least some optimization opportunity. We recommend revisiting this audit quarterly as your team grows and vendors update their pricing. Currently, your stack is efficient and well-matched to your needs.`;
  }
}