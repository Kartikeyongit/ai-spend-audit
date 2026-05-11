import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Report not found</h2>
        <p className="text-slate-600 mb-6">This audit link doesn't exist or has expired.</p>
        <Button asChild>
          <Link href="/">Run your own audit →</Link>
        </Button>
      </div>
    </main>
  );
}