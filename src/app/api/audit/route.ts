import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { runAudit, UserTool } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai-summary";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tools, teamSize, primaryUseCase } = body;

    const userTools: UserTool[] = tools.filter((t: any) => t.toolName && t.planName);

    if (userTools.length === 0) {
      return NextResponse.json({ error: "At least one tool required" }, { status: 400 });
    }

    const auditResult = runAudit(userTools, teamSize || 1, primaryUseCase || "coding");

    // Generate AI summary (fires and forgets — won't block if API fails)
    let aiSummary: string | null = null;
    try {
      aiSummary = await generateAISummary({
        tools: userTools,
        teamSize: teamSize || 1,
        primaryUseCase: primaryUseCase || "coding",
        totalMonthlySavings: auditResult.totalMonthlySavings,
        totalAnnualSavings: auditResult.totalAnnualSavings,
        recommendations: auditResult.recommendations,
      });
    } catch (e) {
      console.error("AI summary generation failed, using fallback:", e);
    }

    // Generate a unique public ID for sharing
    const publicId = randomUUID().slice(0, 8);

    // Save to database
    const audit = await prisma.audit.create({
      data: {
        publicId,
        tools: JSON.parse(JSON.stringify(userTools)),
        teamSize: teamSize || 1,
        primaryUseCase: primaryUseCase || "coding",
        totalMonthlySpend: userTools.reduce((sum: number, t: UserTool) => sum + t.monthlySpend, 0),
        totalMonthlySavings: auditResult.totalMonthlySavings,
        totalAnnualSavings: auditResult.totalAnnualSavings,
        recommendations: JSON.parse(JSON.stringify(auditResult.recommendations)),
        aiSummary: aiSummary,
      }
    });

    return NextResponse.json({
      publicId: audit.publicId,
      ...auditResult,
      aiSummary,
    });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Failed to run audit" }, { status: 500 });
  }
}