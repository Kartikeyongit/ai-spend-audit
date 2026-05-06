import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { runAudit, UserTool } from "@/lib/audit-engine";
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
      }
    });

    return NextResponse.json({
      publicId: audit.publicId,
      ...auditResult
    });
  } catch (error) {
    console.error("Audit error:", error);
    return NextResponse.json({ error: "Failed to run audit" }, { status: 500 });
  }
}