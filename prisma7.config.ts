// Loads the same .env.local Next.js itself reads (not a separate .env) so
// there's one source of truth for local secrets, matching the rest of the
// app's convention.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
