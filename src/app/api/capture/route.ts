import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, role, teamSize, publicId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Rate limit check (simple — by IP in production you'd use Upstash)
    // For now, just check for duplicate emails within 1 hour
    const recentLead = await prisma.lead.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // last hour
        }
      }
    });

    if (recentLead) {
      return NextResponse.json({ error: "Already submitted recently" }, { status: 429 });
    }

    // Update the audit with email capture
    if (publicId) {
      await prisma.audit.update({
        where: { publicId },
        data: {
          email,
          companyName,
          role,
          capturedAt: new Date()
        }
      });
    }

    // Check if high savings
    let highSavings = false;
    if (publicId) {
      const audit = await prisma.audit.findUnique({ where: { publicId } });
      highSavings = (audit?.totalMonthlySavings as number) > 500;
    }

    // Store lead
    await prisma.lead.create({
      data: {
        email,
        companyName,
        role,
        teamSize: teamSize ? parseInt(teamSize) : null,
        auditId: publicId,
        highSavings,
        notified: false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}