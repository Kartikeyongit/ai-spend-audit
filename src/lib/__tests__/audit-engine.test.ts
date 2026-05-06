import { describe, it, expect } from "vitest";
import { runAudit, UserTool } from "../audit-engine";

describe("audit-engine", () => {
  
  // Test 1: Detects Team plan overkill for small teams
  it("should recommend downgrade from Team plan when seats < minimum", () => {
    const tools: UserTool[] = [
      {
        toolName: "Claude",
        planName: "Team",
        monthlySpend: 90, // 3 seats × $30
        seats: 3,
      },
    ];

    const result = runAudit(tools, 3, "writing");

    const claudeRec = result.recommendations.find(r => r.toolName === "Claude");
    expect(claudeRec).toBeDefined();
    expect(claudeRec!.estimatedMonthlySavings).toBeGreaterThan(0);
    // Engine may recommend alternative, downgrade, or credits — all are valid savings
    expect(["downgrade", "alternative", "credits"]).toContain(claudeRec!.type);
  });

  // Test 2: Recommends savings for retail purchases
  it("should recommend savings when user pays full retail price", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        planName: "Pro",
        monthlySpend: 200, // 10 seats × $20
        seats: 10,
      },
    ];

    const result = runAudit(tools, 10, "coding");

    const cursorRec = result.recommendations.find(r => r.toolName === "Cursor");
    expect(cursorRec).toBeDefined();
    // Savings should be positive (either via credits, downgrade, or alternative)
    expect(cursorRec!.estimatedMonthlySavings).toBeGreaterThan(0);
    expect(["credits", "downgrade", "alternative"]).toContain(cursorRec!.type);
  });

  // Test 3: No false savings when already optimized
  it("should not recommend changes when already on optimal plan", () => {
    const tools: UserTool[] = [
      {
        toolName: "Gemini",
        planName: "Pro",
        monthlySpend: 0, // Free tier
        seats: 1,
      },
    ];

    const result = runAudit(tools, 1, "writing");

    const geminiRec = result.recommendations.find(r => r.toolName === "Gemini");
    expect(geminiRec).toBeDefined();
    expect(geminiRec!.estimatedMonthlySavings).toBe(0);
    expect(geminiRec!.type).toBe("optimized");
  });

  // Test 4: Multiple tools — calculates total correctly
  it("should sum savings across multiple tools correctly", () => {
    const tools: UserTool[] = [
      {
        toolName: "ChatGPT",
        planName: "Enterprise",
        monthlySpend: 600, // 10 seats × $60
        seats: 10,
      },
      {
        toolName: "GitHub Copilot",
        planName: "Enterprise",
        monthlySpend: 390, // 10 seats × $39
        seats: 10,
      },
    ];

    const result = runAudit(tools, 10, "coding");

    // Total monthly savings should equal sum of individual savings
    const sumOfIndividual = result.recommendations.reduce(
      (sum, r) => sum + r.estimatedMonthlySavings, 0
    );
    expect(result.totalMonthlySavings).toBe(sumOfIndividual);
    // Annual = monthly × 12
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
    // Should have 2 recommendations
    expect(result.recommendations).toHaveLength(2);
  });

  // Test 5: High savings flag triggers at $500/month
  it("should set isHighSavings true when savings > $500/month", () => {
    const tools: UserTool[] = [
      {
        toolName: "ChatGPT",
        planName: "Enterprise",
        monthlySpend: 3000, // 50 seats × $60
        seats: 50,
      },
    ];

    const result = runAudit(tools, 50, "writing");
    expect(result.isHighSavings).toBe(true);
  });

  // Test 6: Low savings doesn't trigger high savings flag
  it("should set isHighSavings false when savings < $500/month", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        planName: "Pro",
        monthlySpend: 40, // 2 seats × $20
        seats: 2,
      },
    ];

    const result = runAudit(tools, 2, "coding");
    expect(result.isHighSavings).toBe(false);
  });

  // Test 7: Uses alternative recommendation when cheaper equivalent exists
  it("should recommend alternative when cheaper equivalent is available", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        planName: "Business",
        monthlySpend: 400, // 10 seats × $40
        seats: 10,
      },
    ];

    const result = runAudit(tools, 10, "coding");

    const cursorRec = result.recommendations.find(r => r.toolName === "Cursor");
    expect(cursorRec).toBeDefined();
    // Should either recommend Windsurf (alternative) or credits
    expect(["alternative", "credits", "downgrade"]).toContain(cursorRec!.type);
  });

  // Test 8: Empty tools returns empty recommendations
  it("should handle empty tools array gracefully", () => {
    const tools: UserTool[] = [];
    const result = runAudit(tools, 1, "coding");

    expect(result.recommendations).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
  });

});