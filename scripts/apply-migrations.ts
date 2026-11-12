/**
 * Fallback migration runner for hosts where Prisma's schema engine cannot
 * connect (seen with Prisma Postgres behind some networks: P1001 while the
 * `pg` driver connects fine). Applies every pending folder in
 * prisma/migrations inside its own transaction and records it in
 * `_prisma_migrations` exactly like `prisma migrate deploy` would, so the two
 * stay interchangeable.
 *
 *   pnpm db:migrate:pg
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const MIGRATIONS_DIR = join(process.cwd(), "prisma", "migrations");

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) PRIMARY KEY NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMPTZ,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0
)`;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(CREATE_TABLE);
    const applied = await client.query<{ migration_name: string }>(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`,
    );
    const done = new Set(applied.rows.map((row) => row.migration_name));

    const folders = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const name of folders) {
      const file = join(MIGRATIONS_DIR, name, "migration.sql");
      if (!existsSync(file) || done.has(name)) continue;

      const sql = readFileSync(file, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const id = randomUUID();

      await client.query("BEGIN");
      try {
        await client.query(
          `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count) VALUES ($1, $2, $3, now(), 0)`,
          [id, checksum, name],
        );
        await client.query(sql);
        await client.query(
          `UPDATE "_prisma_migrations" SET finished_at = now(), applied_steps_count = 1 WHERE id = $1`,
          [id],
        );
        await client.query("COMMIT");
        console.log(`applied ${name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    console.log("migrations up to date");
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
