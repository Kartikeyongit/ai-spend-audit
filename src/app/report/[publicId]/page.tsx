import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { AuditRecommendation } from "@/lib/audit-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, Zap, CheckCircle, Sparkles, BarChart3, LayoutDashboard, ArrowRight } from "lucide-react";
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
    <main className="min-h-screen bg-[#020617] text-[#f8fafc] relative overflow-hidden selection:bg-[#6366f1]/30 selection:text-white">
      {/* Inline keyframes for ambient orbs */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020617_70%)]" />
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#6366f1]/[0.07] rounded-full blur-[120px] animate-float" />
        <div
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#22d3ee]/[0.06] rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-[#818cf8]/[0.05] rounded-full blur-[80px] animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <a href="https://value-ai-spa-sepia.vercel.app/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow duration-300">
            <Sparkles size={16} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline">ValueAI</span>
        </a>

        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href="https://value-ai-ten.vercel.app/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </a>
          <a
            href="https://ai-spend-audit-taupe.vercel.app/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            <BarChart3 size={16} className="text-[#6366f1]" />
            <span className="hidden sm:inline">Back</span>
          </a>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Hero Savings Number */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#22d3ee]/10 rounded-full mb-6 border border-[#22d3ee]/20">
            {hasSavings ? (
              <TrendingDown className="h-10 w-10 text-[#22d3ee]" />
            ) : (
              <CheckCircle className="h-10 w-10 text-[#22d3ee]" />
            )}
          </div>

          {hasSavings ? (
            <>
              <h1 className="text-4xl font-bold text-[#f8fafc] mb-2">
                You could save
              </h1>
              <p className="text-7xl font-extrabold text-[#6366f1] mb-2" style={{ textShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
                ${audit.totalMonthlySavings as number}
                <span className="text-2xl text-[#64748b] font-normal">/month</span>
              </p>
              <p className="text-2xl text-[#94a3b8]">
                That&apos;s <span className="font-bold text-[#22d3ee]">
                  ${audit.totalAnnualSavings as number}
                </span> per year
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-[#f8fafc] mb-2">
                Your stack is optimized! 🎉
              </h1>
              <p className="text-xl text-[#94a3b8]">
                You&apos;re spending well — no significant savings found right now.
              </p>
            </>
          )}
        </div>

        {/* Per-tool Breakdown */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-[#f8fafc]">Per-tool breakdown</h2>
          {recommendations.map((rec, i) => (
            <Card key={i} className="bg-[#0f172a]/70 backdrop-blur-xl border-[#334155] rounded-2xl shadow-2xl shadow-black/40 text-[#f8fafc]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#f8fafc]">{rec.toolName}</h3>
                  <span className="text-sm text-[#64748b]">
                    Current: ${rec.currentSpend}/month
                  </span>
                </div>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rec.type === "optimized" 
                      ? "bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20"
                      : rec.type === "credits"
                      ? "bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/20"
                      : "bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/20"
                  }`}>
                    {rec.recommendedAction}
                  </div>
                </div>
                <p className="text-sm text-[#94a3b8] mb-2">{rec.reasoning}</p>
                {rec.estimatedMonthlySavings > 0 && (
                  <p className="text-lg font-bold text-[#22d3ee]">
                    Save ${rec.estimatedMonthlySavings}/month
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Summary */}
        <Card className="mb-8 bg-[#0f172a]/70 backdrop-blur-xl border-[#6366f1]/20 rounded-2xl shadow-2xl shadow-black/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-[#6366f1]" />
              <span className="text-sm font-medium text-[#818cf8]">AI-Powered Summary</span>
            </div>
            <p className="text-[#94a3b8] leading-relaxed">
              {audit.aiSummary || (hasSavings
                ? `Your team of ${audit.teamSize} uses ${(audit.tools as any[]).length} AI tools primarily for ${audit.primaryUseCase}. We found ${isHighSavings ? "significant" : "moderate"} savings opportunities totaling $${audit.totalMonthlySavings}/month. The biggest impact comes from right-sizing your subscription plans and considering credit-based purchasing for retail-price tools. Small changes compound quickly — these savings could fund another tool or hire.`
                : `Your current AI tool stack appears well-optimized for your team size (${audit.teamSize}) and use case (${audit.primaryUseCase}). Your spend is in line with what we'd expect. We recommend revisiting this audit quarterly as pricing and your usage patterns evolve.`)}
            </p>
          </CardContent>
        </Card>

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <Card className="mb-8 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white border-0 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                Want to actually save this money?
              </h2>
              <p className="text-[#c7d2fe] mb-6 max-w-md mx-auto">
                ValueAI helps companies like yours save 20-30% on AI infrastructure 
                through discounted credits. Book a free consultation to turn these 
                savings into reality.
              </p>
              <Button size="lg" variant="secondary" asChild className="bg-white text-[#4f46e5] hover:bg-[#f1f5f9] font-semibold">
                <a href="#capture">Book a ValueAI Consultation →</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Already optimized or low savings */}
        {isLowSavings && hasSavings && (
          <Card className="mb-8 bg-[#0f172a]/70 backdrop-blur-xl border-[#334155] rounded-2xl shadow-2xl shadow-black/40">
            <CardContent className="p-6 text-center">
              <p className="text-[#94a3b8] mb-4">
                Your savings are modest but real. Want us to notify you when new 
                optimizations apply to your stack?
              </p>
              <Button variant="outline" asChild className="border-[#334155] hover:border-[#475569] bg-transparent hover:bg-[#1e293b]/50 text-[#94a3b8] hover:text-white transition-all">
                <a href="#capture">Notify me about new optimizations →</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Email Capture */}
        <div id="capture" className="mb-8">
          <EmailCaptureForm publicId={publicId} isHighSavings={isHighSavings} />
        </div>

        {/* Share Button */}
        <ShareButton />
      </div>
    </main>
  );
}