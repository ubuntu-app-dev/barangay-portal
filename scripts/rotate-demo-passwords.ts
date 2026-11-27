/**
 * Gives every account a new random password and prints them once.
 * Use after seeding a database that is reachable from the internet, so the sample
 * accounts do not keep the documented password "Password123".
 *
 *   DATABASE_URL=... npx tsx scripts/rotate-demo-passwords.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword, temporaryPassword } from "../src/server/password";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const users = await db.user.findMany({ select: { id: true, username: true, role: true }, orderBy: [{ role: "asc" }, { username: "asc" }] });
  const rows: { role: string; username: string; password: string }[] = [];
  for (const u of users) {
    const password = temporaryPassword();
    await db.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(password), failedLogins: 0, lockedUntil: null } });
    await db.session.deleteMany({ where: { userId: u.id } });
    rows.push({ role: u.role, username: u.username, password });
  }
  console.table(rows);
}

main().finally(() => db.$disconnect());
