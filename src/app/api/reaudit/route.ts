import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { runAudit, UserTool, AuditRecommendation } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai-summary";
import { TOOLS, API_PRICING } from "@/lib/pricing-data";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ error: "publicId required" }, { status: 400 });
    }

    // Fetch the original audit
    const originalAudit = await prisma.audit.findUnique({
      where: { publicId },
    });

    if (!originalAudit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Run fresh audit with current pricing
    const userTools = originalAudit.tools as unknown as UserTool[];
    const newAuditResult = runAudit(
      userTools,
      originalAudit.teamSize,
      originalAudit.primaryUseCase
    );

    // Generate fresh AI summary
    let newAiSummary: string | null = null;
    try {
      newAiSummary = await generateAISummary({
        tools: userTools,
        teamSize: originalAudit.teamSize,
        primaryUseCase: originalAudit.primaryUseCase,
        totalMonthlySavings: newAuditResult.totalMonthlySavings,
        totalAnnualSavings: newAuditResult.totalAnnualSavings,
        recommendations: newAuditResult.recommendations,
      });
    } catch (e) {
      console.error("AI summary generation failed:", e);
    }

    // Build diff comparison
    const oldRecommendations = originalAudit.recommendations as unknown as AuditRecommendation[];
    const newRecommendations = newAuditResult.recommendations;

    const diff = buildDiff(oldRecommendations, newRecommendations);

    // Store the updated audit with new pricing snapshot
    const currentSnapshot = {
      tools: JSON.parse(JSON.stringify(TOOLS)),
      apiPricing: JSON.parse(JSON.stringify(API_PRICING)),
      capturedAt: new Date().toISOString(),
    };

    await prisma.audit.update({
      where: { publicId },
      data: {
        totalMonthlySavings: newAuditResult.totalMonthlySavings,
        totalAnnualSavings: newAuditResult.totalAnnualSavings,
        recommendations: JSON.parse(JSON.stringify(newRecommendations)),
        aiSummary: newAiSummary,
        pricingSnapshot: currentSnapshot,
      },
    });

    return NextResponse.json({
      publicId,
      original: {
        totalMonthlySavings: originalAudit.totalMonthlySavings,
        totalAnnualSavings: originalAudit.totalAnnualSavings,
        recommendations: oldRecommendations,
      },
      current: {
        totalMonthlySavings: newAuditResult.totalMonthlySavings,
        totalAnnualSavings: newAuditResult.totalAnnualSavings,
        recommendations: newRecommendations,
        aiSummary: newAiSummary,
      },
      diff,
      savingsDelta: newAuditResult.totalMonthlySavings - (originalAudit.totalMonthlySavings as number),
    });
  } catch (error) {
    console.error("Re-audit error:", error);
    return NextResponse.json({ error: "Failed to re-run audit" }, { status: 500 });
  }
}

interface DiffItem {
  toolName: string;
  oldRecommendation: AuditRecommendation;
  newRecommendation: AuditRecommendation;
  changed: boolean;
}

function buildDiff(
  oldRecs: AuditRecommendation[],
  newRecs: AuditRecommendation[]
): DiffItem[] {
  return newRecs.map((newRec) => {
    const oldRec = oldRecs.find((r) => r.toolName === newRec.toolName);
    const changed = oldRec
      ? oldRec.recommendedAction !== newRec.recommendedAction ||
        oldRec.estimatedMonthlySavings !== newRec.estimatedMonthlySavings
      : true;

    return {
      toolName: newRec.toolName,
      oldRecommendation: oldRec || {
        toolName: newRec.toolName,
        currentSpend: 0,
        recommendedAction: "No previous audit",
        estimatedMonthlySavings: 0,
        reasoning: "",
        type: "optimized",
      },
      newRecommendation: newRec,
      changed,
    };
  });
}