import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

const isVoting = process.env.PRISMA_TARGET === "voting";

export default defineConfig({
  schema: isVoting ? "./voting-db/voting.schema.prisma" : "./prisma/schema.prisma",
  datasource: {
    // The Prisma CLI needs the DIRECT (unpooled) connection to push changes to the database
    url: isVoting ? env("VOTING_DIRECT_URL") : env("DATABASE_URL_UNPOOLED"),
  },
});