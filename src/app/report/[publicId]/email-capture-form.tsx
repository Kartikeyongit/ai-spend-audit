"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Building, User, Users } from "lucide-react";

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
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Report saved!</h3>
          <p className="text-green-700">
            {isHighSavings 
              ? "We'll reach out within 24 hours to discuss your savings opportunities."
              : "We'll notify you when new optimizations apply to your stack."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isHighSavings ? "Get your full report & book a consultation" : "Save your report"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email - full width */}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Company + Role - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="company"
                    className="pl-10"
                    placeholder="Acme Inc"
                    value={form.companyName}
                    onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="role"
                    className="pl-10"
                    placeholder="Engineering Manager"
                    value={form.role}
                    onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Team size */}
            <div className="grid gap-1.5">
              <Label htmlFor="teamSize">Team size</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="teamSize"
                  type="number"
                  className="pl-10"
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

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Saving..." : isHighSavings ? "Get Full Report & Book Call" : "Email My Report"}
          </Button>

          <p className="text-xs text-slate-400 text-center mt-3">
            No spam. Your data stays private. We'll only reach out if there's real savings potential.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}