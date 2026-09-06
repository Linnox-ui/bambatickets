import { redirect } from "next/navigation"; // <-- Add this import
import { auth } from "../../auth";
import StudioShell from "../../components/StudioShell";

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

  return <StudioShell user={user}>{children}</StudioShell>;
}
