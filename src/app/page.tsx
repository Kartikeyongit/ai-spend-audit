"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, ArrowRight } from "lucide-react";
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

  // Load from localStorage on mount
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

  // Save to localStorage on change
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Audit Your AI Spend
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Find out how much you&apos;re overspending on AI tools and get actionable recommendations in 60 seconds.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">What AI tools do you use?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.tools.map((tool, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-xs">Tool</Label>
                      <Select
                        value={tool.toolName}
                        onValueChange={(v) => updateTool(index, "toolName", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tool" />
                        </SelectTrigger>
                        <SelectContent>
                          {TOOLS.map(t => (
                            <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {tool.toolName && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Plan</Label>
                            <Select
                              value={tool.planName}
                              onValueChange={(v) => updateTool(index, "planName", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedTool(tool.toolName)?.plans.map(p => (
                                  <SelectItem key={p.name} value={p.name}>
                                    {p.name} — ${p.monthlyPricePerSeat}/seat
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Seats</Label>
                            <Input
                              type="number"
                              min={1}
                              value={tool.seats}
                              onChange={(e) => updateTool(index, "seats", parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Monthly spend</Label>
                          <Input
                            type="number"
                            value={tool.monthlySpend}
                            onChange={(e) => updateTool(index, "monthlySpend", parseFloat(e.target.value) || 0)}
                            placeholder="0"
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
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addTool} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add another tool
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">About your team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Team size</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.teamSize}
                  onChange={(e) => setForm(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label>Primary use case</Label>
                <Select
                  value={form.primaryUseCase}
                  onValueChange={(v) => setForm(prev => ({ ...prev, primaryUseCase: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USE_CASES.map(uc => (
                      <SelectItem key={uc} value={uc} className="capitalize">{uc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full text-lg" disabled={isSubmitting}>
            {isSubmitting ? "Analyzing..." : "Run Free Audit"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </div>
    </main>
  );
}