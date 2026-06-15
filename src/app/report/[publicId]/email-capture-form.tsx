"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Building, User, Users, CheckCircle, Sparkles } from "lucide-react";

interface EmailCaptureFormProps {
  publicId: string;
  isHighSavings: boolean;
}

export function EmailCaptureForm({ publicId, isHighSavings }: EmailCaptureFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    companyName: "",
    role: "",
    teamSize: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, publicId }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to capture email:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-[#0f172a]/70 backdrop-blur-xl border-[#334155] rounded-2xl shadow-2xl shadow-black/40 text-[#f8fafc]">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#22d3ee]/10 rounded-full mb-4 border border-[#22d3ee]/20">
            <CheckCircle className="h-6 w-6 text-[#22d3ee]" />
          </div>
          <h3 className="text-xl font-bold text-[#f8fafc] mb-2">Report saved!</h3>
          <p className="text-[#94a3b8]">
            {isHighSavings 
              ? "We'll reach out within 24 hours to discuss your savings opportunities."
              : "We'll notify you when new optimizations apply to your stack."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0f172a]/70 backdrop-blur-xl border-[#334155] rounded-2xl shadow-2xl shadow-black/40 text-[#f8fafc]">
      {/* Hide native number spinners */}
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <CardHeader className="pb-4 border-b border-[#334155]/60">
        <CardTitle className="text-lg font-semibold text-[#f8fafc] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6366f1]/10 rounded-lg flex items-center justify-center">
            <Sparkles className="text-[#6366f1]" size={16} />
          </div>
          {isHighSavings ? "Get your full report & book a consultation" : "Save your report"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email - full width */}
            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10 bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] placeholder-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Company + Role - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="company" className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Company
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] pointer-events-none" />
                  <Input
                    id="company"
                    className="pl-10 bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] placeholder-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11"
                    placeholder="Acme Inc"
                    value={form.companyName}
                    onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="role" className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                  Role
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] pointer-events-none" />
                  <Input
                    id="role"
                    className="pl-10 bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] placeholder-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11"
                    placeholder="Engineering Manager"
                    value={form.role}
                    onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Team size */}
            <div className="grid gap-1.5">
              <Label htmlFor="teamSize" className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Team size
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] pointer-events-none" />
                <Input
                  id="teamSize"
                  type="number"
                  className="pl-10 bg-[#020617] border-[#334155] rounded-xl text-[#f8fafc] placeholder-[#475569] focus:ring-1 focus:ring-[#6366f1]/30 focus:border-[#6366f1] hover:border-[#475569] transition-all h-11"
                  placeholder="10"
                  value={form.teamSize}
                  onChange={(e) => setForm(prev => ({ ...prev, teamSize: e.target.value }))}
                />
              </div>
            </div>

          </div>

          {/* Honeypot for spam protection */}
          <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <Button
            type="submit"
            className="w-full mt-6 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 rounded-xl h-11"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              isHighSavings ? "Get Full Report & Book Call" : "Email My Report"
            )}
          </Button>

          <p className="text-xs text-[#475569] text-center mt-3">
            No spam. Your data stays private. We&apos;ll only reach out if there&apos;s real savings potential.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}