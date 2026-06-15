"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton() {
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="text-center">
      <p className="text-sm text-[#64748b] mb-3">Share your results</p>
      <Button
        variant="outline"
        size="lg"
        onClick={handleShare}
        className="border-[#334155] hover:border-[#475569] bg-transparent hover:bg-[#1e293b]/50 text-[#94a3b8] hover:text-white transition-all duration-300 rounded-xl px-6 h-11"
      >
        <Share2 className="h-4 w-4 mr-2 text-[#6366f1]" />
        Copy share link
      </Button>
    </div>
  );
}