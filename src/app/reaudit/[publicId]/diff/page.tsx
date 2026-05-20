"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Minus, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DiffItem {
  toolName: string;
  oldRecommendation: {
    recommendedAction: string;
    estimatedMonthlySavings: number;
    reasoning: string;
    type: string;
  };
  newRecommendation: {
    recommendedAction: string;
    estimatedMonthlySavings: number;
    reasoning: string;
    type: string;
  };
  changed: boolean;
}

interface DiffData {
  publicId: string;
  original: {
    totalMonthlySavings: number;
    totalAnnualSavings: number;
  };
  current: {
    totalMonthlySavings: number;
    totalAnnualSavings: number;
  };
  diff: DiffItem[];
  savingsDelta: number;
}

export default function DiffViewPage() {
  const params = useParams();
  const publicId = params.publicId as string;
  
  const [data, setData] = useState<DiffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runReaudit();
  }, [publicId]);

  const runReaudit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/reaudit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      if (!res.ok) {
        throw new Error("Failed to re-run audit");
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Re-running your audit with latest pricing...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Couldn't re-run audit</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={runReaudit}>Try again</Button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const savingsImproved = data.savingsDelta > 0;
  const savingsWorsened = data.savingsDelta < 0;
  const changedItems = data.diff.filter((d) => d.changed);
  const unchangedItems = data.diff.filter((d) => !d.changed);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <Link href={`/reaudit/${publicId}`} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to audit
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Audit Comparison
            </h1>
            <p className="text-slate-600">
              Original audit vs. latest AI tool pricing
            </p>
          </div>
        </div>

        {/* Savings Delta — Hero */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-white border-blue-200">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-slate-500 mb-2">Savings difference</p>
            
            {data.savingsDelta === 0 ? (
              <div className="flex items-center justify-center gap-3">
                <Minus className="h-8 w-8 text-slate-400" />
                <span className="text-4xl font-bold text-slate-600">No change</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                {data.savingsDelta > 0 ? (
                  <TrendingDown className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-red-500" />
                )}
                <span className={`text-4xl font-bold ${data.savingsDelta > 0 ? "text-green-600" : "text-red-500"}`}>
                  {data.savingsDelta > 0 ? "+" : ""}${Math.abs(data.savingsDelta)}
                  <span className="text-lg font-normal">/month</span>
                </span>
              </div>
            )}
            
            <div className="flex justify-center gap-8 mt-4 text-sm">
              <div>
                <span className="text-slate-500">Previous:</span>{" "}
                <span className="font-semibold">${data.original.totalMonthlySavings}/mo</span>
              </div>
              <div>
                <span className="text-slate-500">Current:</span>{" "}
                <span className="font-semibold">${data.current.totalMonthlySavings}/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changed Items */}
        {changedItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
              Changed ({changedItems.length})
            </h2>
            
            <div className="space-y-3">
              {changedItems.map((item, i) => (
                <Card key={i} className="border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-slate-900 text-lg mb-4">{item.toolName}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Old */}
                      <div className="bg-white rounded-lg p-3 border border-slate-200">
                        <p className="text-xs text-slate-400 uppercase font-medium mb-1">Previous</p>
                        <p className="font-medium text-slate-700 text-sm">{item.oldRecommendation.recommendedAction}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.oldRecommendation.reasoning}</p>
                        <p className="text-sm font-bold text-slate-600 mt-2">
                          {item.oldRecommendation.estimatedMonthlySavings > 0 
                            ? `Save $${item.oldRecommendation.estimatedMonthlySavings}/mo` 
                            : "No savings"}
                        </p>
                      </div>

                      {/* New */}
                      <div className="bg-white rounded-lg p-3 border border-blue-200 ring-1 ring-blue-100">
                        <p className="text-xs text-blue-400 uppercase font-medium mb-1">Current</p>
                        <p className="font-medium text-blue-700 text-sm">{item.newRecommendation.recommendedAction}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.newRecommendation.reasoning}</p>
                        <p className="text-sm font-bold text-blue-600 mt-2">
                          {item.newRecommendation.estimatedMonthlySavings > 0 
                            ? `Save $${item.newRecommendation.estimatedMonthlySavings}/mo` 
                            : "No savings"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Unchanged Items */}
        {unchangedItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-500 mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-slate-300 rounded-full"></span>
              Unchanged ({unchangedItems.length})
            </h2>
            
            <div className="space-y-2 opacity-60">
              {unchangedItems.map((item, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-700">{item.toolName}</span>
                        <span className="text-sm text-slate-500 ml-2">— {item.newRecommendation.recommendedAction}</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {item.newRecommendation.estimatedMonthlySavings > 0 
                          ? `Save $${item.newRecommendation.estimatedMonthlySavings}/mo` 
                          : "Optimal"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Re-run button */}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={runReaudit}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Comparison
          </Button>
        </div>

      </div>
    </main>
  );
}