import "dotenv/config";
import prisma from "../src/lib/prisma"; // Adjust path if necessary (e.g., "../src/lib/prisma")

async function main() {
  console.log("🧹 Purging test telemetry and database records...");

  await prisma.ticket.deleteMany({});
  console.log("✔ Tickets wiped.");

  await prisma.booking.deleteMany({});
  console.log("✔ Bookings wiped.");

  await prisma.ticketTier.deleteMany({});
  console.log("✔ Ticket tiers wiped.");

  await prisma.payout.deleteMany({});
  console.log("✔ Payout requests wiped.");

  await prisma.systemLog.deleteMany({});
  console.log("✔ System logs wiped.");

  await prisma.event.deleteMany({});
  console.log("✔ Events wiped.");

  const targetEmail = "innocentlijodi@gmail.com";

  const adminUser = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (adminUser) {
    await prisma.user.deleteMany({
      where: { email: { not: targetEmail } },
    });
    console.log("✔ All test user accounts purged.");

    await prisma.user.update({
      where: { email: targetEmail },
      data: { role: "SUPER_ADMIN" },
    });
    console.log(`🚀 Success! Database is pristine. Only Super Admin (${targetEmail}) remains.`);
  } else {
    console.log(`⚠️ Warning: Account with email ${targetEmail} was not found. Please log into the app with this email first.`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });