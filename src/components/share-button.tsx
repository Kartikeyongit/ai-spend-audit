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
      <p className="text-sm text-slate-500 mb-3">Share your results</p>
      <Button variant="outline" size="lg" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Copy share link
      </Button>
    </div>
  );
}