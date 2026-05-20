import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { detectPricingChanges, getAffectedAudits, PricingChange } from "@/lib/pricing-diff";
import { sendReauditEmail } from "@/lib/email-reaudit";
import { TOOLS, API_PRICING } from "@/lib/pricing-data";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let changes: PricingChange[] = [];

    // If test payload provided, use it. Otherwise, compare against stored snapshots
    if (body.tool && body.plan && body.newPrice) {
      // Manual test mode
      changes = [{
        toolName: body.tool,
        planName: body.plan,
        field: "price",
        oldValue: body.oldPrice || "unknown",
        newValue: body.newPrice,
      }];
    }

    // Fetch all active audits with emails
    const audits = await prisma.audit.findMany({
      where: {
        status: "active",
        email: { not: null },
      },
    });

    // If no manual changes, detect from snapshots
    if (changes.length === 0) {
      // Get unique snapshots and detect changes
      const processedSnapshots = new Set<string>();
      
      for (const audit of audits) {
        if (!audit.pricingSnapshot) continue;
        const snapshotKey = JSON.stringify(audit.pricingSnapshot);
        if (processedSnapshots.has(snapshotKey)) continue;
        processedSnapshots.add(snapshotKey);
        
        const snapshotChanges = detectPricingChanges(audit.pricingSnapshot as any);
        changes.push(...snapshotChanges);
      }
    }

    if (changes.length === 0) {
      return NextResponse.json({
        detected: false,
        message: "No pricing changes detected",
        affectedAudits: 0,
      });
    }

    // Find affected audits
    const affectedAudits = getAffectedAudits(audits, changes);

    // Group by email (one email per user)
    const userMap = new Map<string, any[]>();
    for (const audit of affectedAudits) {
      if (!audit.email) continue;
      if (!userMap.has(audit.email)) {
        userMap.set(audit.email, []);
      }
      userMap.get(audit.email)!.push(audit);
    }

    // Send emails
    let emailsSent = 0;
    for (const [email, userAudits] of userMap) {
      try {
        await sendReauditEmail({
          to: email,
          audits: userAudits.map(a => ({
            publicId: a.publicId,
            tools: a.tools as any,
            totalMonthlySavings: a.totalMonthlySavings as number,
          })),
          changes,
        });
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);
      }
    }

    return NextResponse.json({
      detected: true,
      changes,
      affectedAudits: affectedAudits.length,
      uniqueUsers: userMap.size,
      emailsSent,
    });
  } catch (error) {
    console.error("Detect changes error:", error);
    return NextResponse.json(
      { error: "Failed to detect changes" },
      { status: 500 }
    );
  }
}