import { TOOLS, API_PRICING, ToolPricing, Alternative } from "./pricing-data";

export interface UserTool {
  toolName: string;
  planName: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditRecommendation {
  toolName: string;
  currentSpend: number;
  recommendedAction: string;
  estimatedMonthlySavings: number;
  reasoning: string;
  type: "downgrade" | "alternative" | "credits" | "optimized";
}

export interface AuditResult {
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary: string;
  isHighSavings: boolean; // > $500/month
}

function findTool(toolName: string): ToolPricing | undefined {
  return TOOLS.find(t => t.name === toolName);
}

function findAlternativeSavings(
  tool: ToolPricing,
  currentPlan: string,
  seats: number,
  currentSpend: number,
  useCase: string
): { savings: number; alternative: string; reasoning: string } | null {
  if (!tool.alternatives || tool.alternatives.length === 0) return null;

  for (const alt of tool.alternatives) {
    if (alt.bestFor.includes(useCase)) {
      const altCost = alt.monthlyPricePerSeat * seats;
      const savings = currentSpend - altCost;
      if (savings > 0) {
        return {
          savings,
          alternative: alt.name,
          reasoning: `${alt.name} offers similar capabilities at $${alt.monthlyPricePerSeat}/seat (${alt.savingsNote})`
        };
      }
    }
  }
  return null;
}

function findCheaperPlan(
  tool: ToolPricing,
  currentPlanName: string,
  seats: number,
  currentSpend: number,
  teamSize: number
): { savings: number; recommendation: string; reasoning: string } | null {
  const currentPlan = tool.plans.find(p => p.name === currentPlanName);
  if (!currentPlan) return null;

  // Check if they're on a team plan with too few users
  if (currentPlanName === "Team" && seats < 5) {
    // Could use individual plans
    const proPlan = tool.plans.find(p => p.name === "Pro");
    if (proPlan) {
      const proCost = proPlan.monthlyPricePerSeat * seats;
      const savings = currentSpend - proCost;
      if (savings > 0) {
        return {
          savings,
          recommendation: `Switch to ${proPlan.name}`,
          reasoning: `You have ${seats} users on Team plan (designed for 5+). Switching to ${proPlan.name} individual plans would save money.`
        };
      }
    }
  }

  // Check if a cheaper plan would work for their team size
  for (const plan of tool.plans) {
    if (plan.monthlyPricePerSeat < currentPlan.monthlyPricePerSeat) {
      if (plan.minSeats && plan.minSeats > seats) continue; // can't use plan with min seats
      const planCost = plan.monthlyPricePerSeat * seats;
      const savings = currentSpend - planCost;
      if (savings > 10) { // Only recommend if meaningful savings
        return {
          savings,
          recommendation: `Downgrade to ${plan.name}`,
          reasoning: `Based on your usage pattern and team size of ${teamSize}, the ${plan.name} plan at $${plan.monthlyPricePerSeat}/seat may be sufficient.`
        };
      }
    }
  }
  return null;
}

function estimateCreditSavings(currentSpend: number): number {
  // Credex typically offers 15-30% off retail
  return Math.round(currentSpend * 0.2 * 100) / 100;
}

export function runAudit(
  userTools: UserTool[],
  teamSize: number,
  primaryUseCase: string
): AuditResult {
  const recommendations: AuditRecommendation[] = [];
  let totalMonthlySavings = 0;

  for (const userTool of userTools) {
    const tool = findTool(userTool.toolName);
    let bestSavings = 0;
    let bestAction = "";
    let bestReasoning = "";

    if (tool) {
      // Check 1: Could they downgrade?
      const downgradeResult = findCheaperPlan(
        tool,
        userTool.planName,
        userTool.seats,
        userTool.monthlySpend,
        teamSize
      );
      if (downgradeResult && downgradeResult.savings > bestSavings) {
        bestSavings = downgradeResult.savings;
        bestAction = downgradeResult.recommendation;
        bestReasoning = downgradeResult.reasoning;
      }

      // Check 2: Is there a cheaper alternative?
      const alternativeResult = findAlternativeSavings(
        tool,
        userTool.planName,
        userTool.seats,
        userTool.monthlySpend,
        primaryUseCase
      );
      if (alternativeResult && alternativeResult.savings > bestSavings) {
        bestSavings = alternativeResult.savings;
        bestAction = `Switch to ${alternativeResult.alternative}`;
        bestReasoning = alternativeResult.reasoning;
      }
    }

    // Check 3: Credit savings (always an option if paying retail)
    const creditSavings = estimateCreditSavings(userTool.monthlySpend);
    if (creditSavings > bestSavings && creditSavings > 20) {
      bestSavings = creditSavings;
      bestAction = "Purchase through Credex credits";
      bestReasoning = `You're paying retail. Credex credits can save ${Math.round((creditSavings / userTool.monthlySpend) * 100)}% on this tool.`;
    }

    if (bestSavings > 0) {
      recommendations.push({
        toolName: userTool.toolName,
        currentSpend: userTool.monthlySpend,
        recommendedAction: bestAction,
        estimatedMonthlySavings: Math.round(bestSavings * 100) / 100,
        reasoning: bestReasoning,
        type: bestAction.includes("Credex") ? "credits" : 
              bestAction.includes("Switch") ? "alternative" :
              bestAction.includes("Downgrade") ? "downgrade" : "optimized"
      });
      totalMonthlySavings += bestSavings;
    } else {
      recommendations.push({
        toolName: userTool.toolName,
        currentSpend: userTool.monthlySpend,
        recommendedAction: "No change needed",
        estimatedMonthlySavings: 0,
        reasoning: "You're on the right plan for your team size and use case.",
        type: "optimized"
      });
    }
  }

  const totalAnnualSavings = Math.round(totalMonthlySavings * 12 * 100) / 100;
  totalMonthlySavings = Math.round(totalMonthlySavings * 100) / 100;

  const summary = totalMonthlySavings > 0
    ? `You could save $${totalMonthlySavings}/month ($${totalAnnualSavings}/year) by optimizing your AI tool stack.`
    : "Your AI tool stack is optimized! No significant savings found.";

  return {
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings,
    summary,
    isHighSavings: totalMonthlySavings > 500
  };
}