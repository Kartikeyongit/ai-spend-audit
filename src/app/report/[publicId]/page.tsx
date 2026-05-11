import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { AuditRecommendation } from "@/lib/audit-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, Zap, CheckCircle } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { Metadata } from "next";
import { EmailCaptureForm } from "./email-capture-form";

const prisma = new PrismaClient();

interface ReportPageProps {
  params: { publicId: string };
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { publicId } = await params;

  const audit = await prisma.audit.findUnique({
    where: { publicId: publicId }
  });

  if (!audit) return { title: "Report not found" };

  const savings = audit.totalMonthlySavings as number;
  
  return {
    title: savings > 0 
      ? `AI Spend Audit — Save $${savings}/month` 
      : "AI Spend Audit — Your Stack is Optimized",
    description: savings > 0
      ? `We found $${savings}/month in potential savings on AI tools.`
      : "Your AI tool stack is well-optimized. No significant savings found.",
    openGraph: {
      title: savings > 0 
        ? `Save $${savings}/month on AI Tools` 
        : "Is your AI stack optimized?",
      description: "Run a free AI spend audit in 60 seconds.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: savings > 0 
        ? `Save $${savings}/month on AI Tools` 
        : "Audit Your AI Spend",
      description: "Free AI spend audit tool. Find savings in 60 seconds.",
    }
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { publicId } = await params;

  const audit = await prisma.audit.findUnique({
    where: { publicId: publicId }
  });

  if (!audit) notFound();

  const recommendations = audit.recommendations as unknown as AuditRecommendation[];
  const hasSavings = (audit.totalMonthlySavings as number) > 0;
  const isHighSavings = (audit.totalMonthlySavings as number) > 500;
  const isLowSavings = (audit.totalMonthlySavings as number) < 100;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Hero Savings Number */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            {hasSavings ? (
              <TrendingDown className="h-10 w-10 text-green-600" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-600" />
            )}
          </div>
          
          {hasSavings ? (
            <>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                You could save
              </h1>
              <p className="text-5x1 md:text-7xl font-extrabold text-green-600 mb-2">
                ${audit.totalMonthlySavings as number}
                <span className="text-2xl text-slate-500 font-normal">/month</span>
              </p>
              <p className="text-2xl text-slate-600">
                That's <span className="font-bold text-green-600">
                  ${audit.totalAnnualSavings as number}
                </span> per year
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Your stack is optimized! 🎉
              </h1>
              <p className="text-xl text-slate-600">
                You're spending well — no significant savings found right now.
              </p>
            </>
          )}
        </div>

        {/* Per-tool Breakdown */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Per-tool breakdown</h2>
          {recommendations.map((rec, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">{rec.toolName}</h3>
                  <span className="text-sm text-slate-500">
                    Current: ${rec.currentSpend}/month
                  </span>
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rec.type === "optimized" 
                      ? "bg-green-100 text-green-700"
                      : rec.type === "credits"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {rec.recommendedAction}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">{rec.reasoning}</p>
                {rec.estimatedMonthlySavings > 0 && (
                  <p className="text-lg font-bold text-green-600">
                    Save ${rec.estimatedMonthlySavings}/month
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Summary */}
        <Card className="mb-8 bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">AI-Powered Summary</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {audit.aiSummary || (hasSavings
                ? `Your team of ${audit.teamSize} uses ${(audit.tools as any[]).length} AI tools primarily for ${audit.primaryUseCase}. We found ${isHighSavings ? "significant" : "moderate"} savings opportunities totaling $${audit.totalMonthlySavings}/month. The biggest impact comes from right-sizing your subscription plans and considering credit-based purchasing for retail-price tools. Small changes compound quickly — these savings could fund another tool or hire.`
                : `Your current AI tool stack appears well-optimized for your team size (${audit.teamSize}) and use case (${audit.primaryUseCase}). Your spend is in line with what we'd expect. We recommend revisiting this audit quarterly as pricing and your usage patterns evolve.`)}
            </p>
          </CardContent>
        </Card>

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                Want to actually save this money?
              </h2>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                Credex helps companies like yours save 20-30% on AI infrastructure 
                through discounted credits. Book a free consultation to turn these 
                savings into reality.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <a href="#capture">Book a Credex Consultation →</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Already optimized or low savings */}
        {isLowSavings && hasSavings && (
          <Card className="mb-8 bg-slate-100 border-slate-200">
            <CardContent className="p-6 text-center">
              <p className="text-slate-700 mb-4">
                Your savings are modest but real. Want us to notify you when new 
                optimizations apply to your stack?
              </p>
              <Button variant="outline" asChild>
                <a href="#capture">Notify me about new optimizations →</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Email Capture */}
        <div id="capture" className="mb-8">
          <EmailCaptureForm publicId={params.publicId} isHighSavings={isHighSavings} />
        </div>

        {/* Share Button */}
        <ShareButton />
      </div>
    </main>
  );
}