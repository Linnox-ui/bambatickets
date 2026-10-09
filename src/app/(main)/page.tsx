import prisma from "@/lib/prisma";
import EventBrowser from "@/components/EventBrowser";

export const revalidate = 60; // Cache and revalidate every 60s for scale

export default async function PublicHomePage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      ticketTiers: {
        include: {
          _count: {
            select: { tickets: true },
          },
        },
      },
      organizer: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { date: "asc" },
  });

  return <EventBrowser initialEvents={events} />;
}