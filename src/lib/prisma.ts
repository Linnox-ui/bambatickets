import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // 1. Get the connection string from your environment
  const connectionString = `${process.env.DATABASE_URL}`;

  // 2. Create a standard Postgres connection pool
  const pool = new Pool({ connectionString });

  // 3. Wrap it in the Prisma adapter
  const adapter = new PrismaPg(pool);

  // 4. Pass the adapter to PrismaClient
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
