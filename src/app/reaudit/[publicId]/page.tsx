import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { AuditRecommendation } from "@/lib/audit-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, TrendingUp, Minus, RefreshCw } from "lucide-react";
import { Metadata } from "next";

const prisma = new PrismaClient();

interface ReauditPageProps {
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: ReauditPageProps): Promise<Metadata> {
  const { publicId } = await params;
  
  return {
    title: `Re-audit — AI Spend Audit`,
    description: "Compare your original audit with the latest AI tool pricing.",
  };
}

export default async function ReauditPage({ params }: ReauditPageProps) {
  const { publicId } = await params;

  const audit = await prisma.audit.findUnique({
    where: { publicId },
  });

  if (!audit) notFound();

  // The audit page shows the CURRENT state after re-audit
  // To see a diff, user hits /api/reaudit and we compare
  // For now, render the audit with a "Re-run with latest pricing" button
  
  const recommendations = audit.recommendations as unknown as AuditRecommendation[];
  const hasSavings = (audit.totalMonthlySavings as number) > 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Re-audit Your AI Spend
          </h1>
          <p className="text-slate-600">
            Compare your original audit with the latest pricing. Click below to re-run.
          </p>
        </div>

        {/* Current State */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Current Audit (as of {new Date(audit.updatedAt).toLocaleDateString()})
            </h2>
            
            <div className="text-center mb-6">
              {hasSavings ? (
                <>
                  <p className="text-4xl font-bold text-green-600">
                    ${audit.totalMonthlySavings as number}
                    <span className="text-lg text-slate-500 font-normal">/month savings</span>
                  </p>
                </>
              ) : (
                <p className="text-xl text-green-600 font-medium">✅ Your stack is optimized</p>
              )}
            </div>

            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="font-medium text-slate-900">{rec.toolName}</span>
                    <span className="text-sm text-slate-500 ml-2">— {rec.recommendedAction}</span>
                  </div>
                  <span className="font-medium text-green-600">
                    {rec.estimatedMonthlySavings > 0 ? `Save $${rec.estimatedMonthlySavings}/mo` : "Optimal"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Re-run Button */}
        <div className="text-center">
          <form action={`/api/reaudit-view/${publicId}`} method="GET">
            <Button type="submit" size="lg" className="text-lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Re-run with Latest Pricing
            </Button>
          </form>
          <p className="text-sm text-slate-500 mt-3">
            We'll compare your original audit with current AI tool pricing and show you what changed.
          </p>
        </div>

      </div>
    </main>
  );
}