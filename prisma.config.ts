import "dotenv/config";
import { defineConfig } from "prisma/config";
import { directDatabaseUrl } from "./utils/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --conditions=react-server prisma/seed.ts",
  },
  datasource: {
    // CLI work (migrate, studio) needs a session connection, not the
    // transaction pooler the app queries through.
    url: directDatabaseUrl(process.env) ?? "",
  },
});
