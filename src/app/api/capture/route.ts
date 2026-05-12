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
    try {
      await prisma.lead.create({
        data: {
          email,
          companyName,
          role,
          teamSize: teamSize ? parseInt(teamSize) : null,
          auditId: publicId || null,
          highSavings,
          notified: false
        }
      });
    } catch (leadError: any) {
      // P2002: duplicate email — already captured
      if (leadError?.code === "P2002") {
        return NextResponse.json({ success: true, duplicate: true });
      }
      // P2003: foreign key — audit doesn't exist, save without auditId
      if (leadError?.code === "P2003") {
        await prisma.lead.create({
          data: {
            email,
            companyName,
            role,
            teamSize: teamSize ? parseInt(teamSize) : null,
            highSavings: false,
            notified: false
          }
        });
        return NextResponse.json({ success: true });
      }
      throw leadError;
    }

    // Send confirmation email (non-blocking)
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