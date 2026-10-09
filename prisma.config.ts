import "dotenv/config";
import { defineConfig } from "@prisma/config";

const isVoting = process.env.PRISMA_TARGET === "voting";
const urlName = isVoting ? "VOTING_DIRECT_URL" : "DATABASE_URL_UNPOOLED";
const url = process.env[urlName];

// On Vercel/CI, `prisma generate` never connects to the database, so a
// placeholder is fine. Locally, fail loudly so db push/migrate can't hit it.
const isCI = Boolean(process.env.VERCEL || process.env.CI);

if (!url && !isCI) {
  throw new Error(`Missing ${urlName}`);
}

export default defineConfig({
  schema: isVoting ? "./voting-db/voting.schema.prisma" : "./prisma/schema.prisma",
  datasource: {
    // The Prisma CLI needs the DIRECT (unpooled) connection to push changes to the database
    url: url ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});