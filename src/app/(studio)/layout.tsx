import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import StudioShell from "../../components/StudioShell";

// 1. Add this Viewport export to stop mobile browsers from "zooming out"
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zooming on mobile
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If the user is NOT logged in, kick them to the login page immediately
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
  }; 

  // 2. Wrap the StudioShell in a strict overflow-hidden container
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <StudioShell user={user}>{children}</StudioShell>
    </div>
  );
}