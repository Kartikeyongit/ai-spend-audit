import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";

export const metadata: Metadata = {
  title: "AI Spend Audit — Find Savings in 60 Seconds",
  description: "Free tool to audit your AI tool spending. Find out where you're overspending on Cursor, ChatGPT, Claude, and more.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AI Spend Audit — Find Savings in 60 Seconds",
    description: "Free tool to audit your AI spend. Find savings in 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <body className="min-h-full flex flex-col bg-[#020617] text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}