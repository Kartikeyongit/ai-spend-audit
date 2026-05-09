import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendAuditConfirmationEmail } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, role, teamSize, publicId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Rate limit check — duplicate emails within 1 hour
    const recentLead = await prisma.lead.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      }
    });

    if (recentLead) {
      return NextResponse.json({ error: "Already submitted recently" }, { status: 429 });
    }

    // Update the audit with email capture
    let highSavings = false;
    let totalMonthlySavings = 0;
    
    if (publicId) {
      const audit = await prisma.audit.findUnique({ where: { publicId } });
      if (audit) {
        highSavings = (audit.totalMonthlySavings as number) > 500;
        totalMonthlySavings = audit.totalMonthlySavings as number;
        
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

    // Send confirmation email (non-blocking — don't wait for it)
    if (publicId) {
      sendAuditConfirmationEmail({
        to: email,
        publicId,
        totalMonthlySavings,
        isHighSavings: highSavings,
      }).catch((err) => console.error("Email send failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}