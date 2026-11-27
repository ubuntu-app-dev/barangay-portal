import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/** One Prisma client per server process (dev hot reload would otherwise open a new pool on every edit). */
const globalForDb = globalThis as unknown as { db?: PrismaClient };

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add it to .env.local.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

export const db = globalForDb.db ?? create();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
