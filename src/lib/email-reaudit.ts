import { Resend } from "resend";
import { PricingChange } from "./pricing-diff";

let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.warn("Resend client initialization failed:", e);
}

interface ReauditEmailParams {
  to: string;
  audits: Array<{
    publicId: string;
    tools: any[];
    totalMonthlySavings: number;
  }>;
  changes: PricingChange[];
}

export async function sendReauditEmail({ to, audits, changes }: ReauditEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn("Resend not configured — skipping re-audit email");
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  // Build changes summary
  const changesList = changes
    .map((c) => {
      if (c.field === "price") {
        return `${c.toolName} ${c.planName}: $${c.oldValue} → $${c.newValue}/month`;
      } else if (c.field === "plan_added") {
        return `${c.toolName}: New ${c.planName} plan added at $${c.newValue}/month`;
      } else if (c.field === "plan_removed") {
        return `${c.toolName}: ${c.planName} plan discontinued`;
      }
      return `${c.toolName}: ${c.field} changed`;
    })
    .join("<br>");

  // Build audit links
  const auditLinks = audits
    .map(
      (a) =>
        `<a href="${baseUrl}/reaudit/${a.publicId}" style="color: #2563eb; font-weight: 600;">Re-run audit →</a> (previous savings: $${a.totalMonthlySavings}/month)`
    )
    .join("<br><br>");

  const totalAudits = audits.length;
  const totalSavings = audits.reduce((sum, a) => sum + a.totalMonthlySavings, 0);

  try {
    const { error } = await resend.emails.send({
      from: "AI Spend Audit <audit@yourdomain.com>",
      to: [to],
      subject: `🔔 AI pricing changed — your audit may be outdated (${changes.length} change${changes.length > 1 ? "s" : ""})`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    
    <h1 style="color: #0f172a; font-size: 22px; margin-bottom: 8px;">
      AI tool pricing has changed
    </h1>
    <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
      Some of the AI tools in your previous audit have updated their pricing. Your savings estimates may no longer be accurate.
    </p>
    
    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
        What changed:
      </p>
      <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
        ${changesList}
      </p>
    </div>
    
    <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">
      You have ${totalAudits} audit${totalAudits > 1 ? "s" : ""} that may be affected. Previous combined savings: <strong>$${totalSavings}/month</strong>.
    </p>
    
    <div style="margin-bottom: 24px;">
      <p style="color: #475569; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
        Re-run your audit${totalAudits > 1 ? "s" : ""}:
      </p>
      ${auditLinks}
    </div>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
    
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      You received this email because you ran an AI Spend Audit and captured your results. 
      We'll only email you when pricing changes affect your specific tools.
    </p>
    
  </div>
  
  <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
    Sent by AI Spend Audit · <a href="https://credex.rocks" style="color: #94a3b8;">Powered by Credex</a>
  </p>
  
</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send re-audit email:", error);
    return false;
  }
}