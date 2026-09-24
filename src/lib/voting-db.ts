import { PrismaClient as VotingPrismaClient } from "@/src/generated/prisma-voting";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  votingPrisma: VotingPrismaClient | undefined;
};

const createPrismaClient = () => {
  // Using your exact, correct original adapter setup. No weird fallbacks.
  const adapter = new PrismaNeon({ connectionString: process.env.VOTING_DATABASE_URL! });
  return new VotingPrismaClient({ adapter });
};

export const votingPrisma = globalForPrisma.votingPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.votingPrisma = votingPrisma;
}