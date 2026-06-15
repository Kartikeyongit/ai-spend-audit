"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, ArrowRight, Sparkles, BarChart3, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { TOOLS } from "@/lib/pricing-data";
import { UserTool } from "@/lib/audit-engine";

const USE_CASES = ["coding", "writing", "data", "research", "mixed"];

interface FormState {
  tools: UserTool[];
  teamSize: number;
  primaryUseCase: string;
}

const EMPTY_FORM: FormState = {
  tools: [{ toolName: "", planName: "", monthlySpend: 0, seats: 1 }],
  teamSize: 1,
  primaryUseCase: "coding"
};

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("audit-form");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        // ignore corrupted data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("audit-form", JSON.stringify(form));
  }, [form]);

  const addTool = () => {
    setForm(prev => ({
      ...prev,
      tools: [...prev.tools, { toolName: "", planName: "", monthlySpend: 0, seats: 1 }]
    }));
  };

  const removeTool = (index: number) => {
    setForm(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index)
    }));
  };

  const updateTool = (index: number, field: keyof UserTool, value: string | number) => {
    setForm(prev => {
      const tools = [...prev.tools];
      
      if (field === "toolName" && typeof value === "string") {
        tools[index] = { ...tools[index], toolName: value, planName: "", monthlySpend: 0 };
      } else if (field === "planName" && typeof value === "string") {
        const tool = TOOLS.find(t => t.name === tools[index].toolName);
        const plan = tool?.plans.find(p => p.name === value);
        tools[index] = {
          ...tools[index],
          planName: value,
          monthlySpend: plan ? plan.monthlyPricePerSeat * tools[index].seats : 0
        };
      } else if (field === "seats" && typeof value === "number") {
        const tool = TOOLS.find(t => t.name === tools[index].toolName);
        const plan = tool?.plans.find(p => p.name === tools[index].planName);
        tools[index] = {
          ...tools[index],
          seats: value,
          monthlySpend: plan ? plan.monthlyPricePerSeat * value : tools[index].monthlySpend
        };
      } else {
        (tools[index] as any)[field] = value;
      }
      
      return { ...prev, tools };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      router.push(`/report/${data.publicId}`);
    } catch (error) {
      console.error("Failed to run audit:", error);
      setIsSubmitting(false);
    }
  };

  const selectedTool = (toolName: string) => TOOLS.find(t => t.name === toolName);

  return (
    <main className="min-h-screen bg-[#020617] text-[#f8fafc] font-[Sora,sans-serif] relative overflow-hidden selection:bg-[#6366f1]/30 selection:text-white">
      {/* Inline styles: float animation + hide number spinners + dropdown hover fix */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        
        /* Hide native number input spinners (light theme issue) */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* ========== RICH BACKGROUND ========== */}
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
        <div
          className="absolute top-[10%] left-[20%] w-[250px] h-[250px] bg-[#4f46e5]/[0.06] rounded-full blur-[90px] animate-float"
          style={{ animationDelay: "6s" }}
        />
      </div>

      {/* ========== TOP NAVIGATION ========== */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow duration-300">
            <Sparkles size={16} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline">ValueAI</span>
        </a>

        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href="/dashboard/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </a>
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/[0.03] transition-all duration-200"
          >
            <BarChart3 size={16} className="text-[#6366f1]" />
            <span className="hidden sm:inline">Home</span>
          </a>
        </div>
      </nav>

      {/* ========== CONTENT ========== */}
      <div
        className={`relative z-10 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[11px] font-semibold text-[#818cf8] uppercase tracking-wider mb-6">
            <BarChart3 size={12} />
            AI Spend Audit Tool
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Audit Your{" "}
            <span className="text-[#6366f1]" style={{ textShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
              AI Spend
            </span>
          </h1>
          <p className="text-xl text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Find out how much you&apos;re overspending on AI tools and get actionable recommendations in 60 seconds.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4 pb-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tools Card */}
            <Card className="bg-[#0f172a]/70 backdrop-blur-xl border-[#334155] rounded-2xl shadow-2xl shadow-black/40 text-[#f8fafc]">
              <CardHeader className="pb-4 border-b border-[#334155]/60">
                <CardTitle className="text-lg font-semibold text-[#f8fafc] flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#6366f1]/10 rounded-lg flex items-center justify-center">
                    <PlusCircle className="text-[#6366f1]" size={16} />
                  </div>
                  What AI tools do you use?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {form.tools.map((tool, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-4 bg-[#020617]/60 border border-[#334155] rounded-xl hover:border-[#475569] transition-colors duration-300"
                  >
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 block">
                          Tool
                        </Label>
                        <Select
                          value={tool.toolName}
                          onValueChange={(v) => updateTool(index, "toolName", v)}
                        >
                          <SelectTrigger className="bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] data-[placeholder]:text-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11">
                            <SelectValue placeholder="Select tool" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1e293b] border-[#334155] text-[#f8fafc]">
                            {TOOLS.map(t => (
                              <SelectItem
                                key={t.name}
                                value={t.name}
                                className="text-[#f8fafc] data-[highlighted]:bg-[#6366f1]/20 data-[highlighted]:text-[#f8fafc] data-[state=checked]:text-[#f8fafc] cursor-pointer"
                              >
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {tool.toolName && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 block">
                                Plan
                              </Label>
                              <Select
                                value={tool.planName}
                                onValueChange={(v) => updateTool(index, "planName", v)}
                              >
                                <SelectTrigger className="bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] data-[placeholder]:text-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11">
                                  <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-[#334155] text-[#f8fafc]">
                                  {selectedTool(tool.toolName)?.plans.map(p => (
                                    <SelectItem
                                      key={p.name}
                                      value={p.name}
                                      className="text-[#f8fafc] data-[highlighted]:bg-[#6366f1]/20 data-[highlighted]:text-[#f8fafc] data-[state=checked]:text-[#f8fafc] cursor-pointer"
                                    >
                                      {p.name} — ${p.monthlyPricePerSeat}/seat
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 block">
                                Seats
                              </Label>
                              <Input
                                type="number"
                                min={1}
                                value={tool.seats}
                                onChange={(e) => updateTool(index, "seats", parseInt(e.target.value) || 1)}
                                className="bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 block">
                              Monthly spend
                            </Label>
                            <Input
                              type="number"
                              value={tool.monthlySpend}
                              onChange={(e) => updateTool(index, "monthlySpend", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] placeholder-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {form.tools.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTool(index)}
                        className="mt-6 hover:bg-red-500/10 hover:text-red-400 text-[#64748b] transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addTool}
                  className="w-full border-[#334155] hover:border-[#475569] bg-transparent hover:bg-[#1e293b]/50 text-[#94a3b8] hover:text-white transition-all duration-300 rounded-xl py-5"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add another tool
                </Button>
              </CardContent>
            </Card>

            {/* Team Card */}
            <Card className="bg-[#0f172a]/70 backdrop-blur-xl border-[#334155] rounded-2xl shadow-2xl shadow-black/40 text-[#f8fafc]">
              <CardHeader className="pb-4 border-b border-[#334155]/60">
                <CardTitle className="text-lg font-semibold text-[#f8fafc] flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#22d3ee]/10 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="text-[#22d3ee]" size={16} />
                  </div>
                  About your team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 block">
                    Team size
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.teamSize}
                    onChange={(e) => setForm(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                    className="bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 block">
                    Primary use case
                  </Label>
                  <Select
                    value={form.primaryUseCase}
                    onValueChange={(v) => setForm(prev => ({ ...prev, primaryUseCase: v }))}
                  >
                    <SelectTrigger className="bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] data-[placeholder]:text-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-[#334155] text-[#f8fafc]">
                      {USE_CASES.map(uc => (
                        <SelectItem
                          key={uc}
                          value={uc}
                          className="capitalize text-[#f8fafc] data-[highlighted]:bg-[#6366f1]/20 data-[highlighted]:text-[#f8fafc] data-[state=checked]:text-[#f8fafc] cursor-pointer"
                        >
                          {uc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full py-4 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Run Free Audit
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}