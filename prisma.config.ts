import { config as load } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js reads .env.local; the Prisma CLI does not, so load it here too.
// Variables already set in the shell (or on Vercel) take precedence.
load({ path: ".env.local", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Migrations need a direct (session) connection; the app itself can use a pooled DATABASE_URL.
  // Empty during `prisma generate` on Vercel, which does not connect.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || "" },
});
