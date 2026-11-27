import { config as load } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js reads .env.local; the Prisma CLI does not, so load it here too.
load({ path: ".env.local", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: env("DATABASE_URL") },
});
