import { Resend } from "resend";

let resend: Resend | null = null;
try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch (e) {
  console.warn("Resend client initialization failed:", e);
}

interface SendAuditEmailParams {
  to: string;
  publicId: string;
  totalMonthlySavings: number;
  isHighSavings: boolean;
}

export async function sendAuditConfirmationEmail({
  to,
  publicId,
  totalMonthlySavings,
  isHighSavings,
}: SendAuditEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn("Resend not configured — skipping email send");
    return false;
  }

  const reportUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/report/${publicId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "AI Spend Audit <audit@yourdomain.com>", // Change to your verified domain
      to: [to],
      subject: isHighSavings
        ? `You're overspending on AI tools by $${totalMonthlySavings}/month`
        : "Your AI Spend Audit Report",
      html: buildEmailTemplate({
        reportUrl,
        totalMonthlySavings,
        isHighSavings,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

function buildEmailTemplate({
  reportUrl,
  totalMonthlySavings,
  isHighSavings,
}: {
  reportUrl: string;
  totalMonthlySavings: number;
  isHighSavings: boolean;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    
    <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 16px;">
      ${isHighSavings 
        ? `💰 You could save $${totalMonthlySavings}/month on AI tools`
        : "📊 Your AI Spend Audit Report"
      }
    </h1>
    
    ${totalMonthlySavings > 0 ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #166534; font-size: 18px; font-weight: 600; margin: 0;">
          Potential savings: $${totalMonthlySavings}/month
        </p>
      </div>
    ` : `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #166534; font-size: 16px; margin: 0;">
          ✅ Your AI tool stack is well-optimized. Good job!
        </p>
      </div>
    `}
    
    <a href="${reportUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
      View Full Report →
    </a>
    
    ${isHighSavings ? `
      <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 24px;">
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Your savings are significant. A Credex team member will reach out within 24 hours 
          to discuss how discounted AI infrastructure credits can help you capture these savings.
        </p>
      </div>
    ` : `
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
        You can revisit this audit anytime at the link above. We'll notify you when new 
        optimizations apply to your stack.
      </p>
    `}
    
  </div>
  
  <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
    Sent by AI Spend Audit · <a href="https://credex.rocks" style="color: #94a3b8;">Powered by Credex</a>
  </p>
  
</body>
</html>
  `;
}