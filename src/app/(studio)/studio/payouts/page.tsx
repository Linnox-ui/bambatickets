import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import prisma from "../../../../lib/prisma";
import PayoutManager from "./PayoutManager";

export default async function PayoutsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      payoutMethod: true,
      payoutAccountName: true,
      payoutAccountNumber: true,
      payoutBankName: true,
    },
  });

  return <PayoutManager initialData={user} />;
}
