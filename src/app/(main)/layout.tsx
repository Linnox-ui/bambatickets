import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bamba Tickets | Discover Events & Live Voting in Kenya",
  description:
    "Explore upcoming concerts, festivals, and live voting polls across Kenya. Instant checkout with M-Pesa.",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}