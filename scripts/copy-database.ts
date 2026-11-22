/**
 * Copies every row from SOURCE_DATABASE_URL (e.g. the old Prisma Postgres)
 * into the target database (DIRECT_URL, else DATABASE_URL — Supabase),
 * images (media_blobs) included. Apply the migrations to the target first.
 *
 *   pnpm db:copy              # target tables must be empty
 *   pnpm db:copy --truncate   # replace whatever the target holds
 *
 * All-or-nothing: the target is written in one transaction. Foreign keys are
 * dropped and re-created around the copy, so table order and self-references
 * do not matter, and every value travels in its text form (exact round-trip
 * for bytea, json, enums, arrays and timestamps). Row counts are compared
 * before commit.
 */
import "dotenv/config";
import pg from "pg";
import { ERROR_MESSAGES } from "../lib/constants/error-messages";
import { directDatabaseUrl, withLibpqSslMode } from "../utils/database-url";
import {
  countRows,
  ident,
  listColumns,
  listForeignKeys,
  listSerialColumns,
  listTables,
} from "./copy-database/catalog";

const SKIP_TABLES: ReadonlySet<string> = new Set(["_prisma_migrations"]);
const FETCH_ROWS = 100;
const FLUSH_ROWS = 200;
const FLUSH_BYTES = 8 * 1024 * 1024;

type Row = (string | null)[];

const textOnly: pg.CustomTypesConfig = {
  getTypeParser: (() => (value: string) => value) as pg.CustomTypesConfig["getTypeParser"],
};

function connect(url: string): pg.Client {
  return new pg.Client({ connectionString: withLibpqSslMode(url), types: textOnly });
}

async function insertRows(target: pg.Client, table: string, columns: string[], rows: Row[]): Promise<void> {
  if (rows.length === 0) return;
  const width = columns.length;
  const tuples = rows.map((_, r) => `(${columns.map((__, c) => `$${r * width + c + 1}`).join(", ")})`);
  await target.query(
    `INSERT INTO ${ident(table)} (${columns.map(ident).join(", ")}) VALUES ${tuples.join(", ")}`,
    rows.flat(),
  );
}

async function copyTable(source: pg.Client, target: pg.Client, table: string): Promise<number> {
  const sourceColumns = new Set(await listColumns(source, table));
  const columns = (await listColumns(target, table)).filter((column) => sourceColumns.has(column));
  const cursor = `copy_${table.replace(/\W/g, "_")}`;
  await source.query(`DECLARE ${cursor} NO SCROLL CURSOR FOR SELECT ${columns.map(ident).join(", ")} FROM ${ident(table)}`);

  let copied = 0;
  let pending: Row[] = [];
  let pendingBytes = 0;
  for (;;) {
    const { rows } = await source.query<Row>({ text: `FETCH ${FETCH_ROWS} FROM ${cursor}`, rowMode: "array" });
    for (const row of rows) {
      pending.push(row);
      pendingBytes += row.reduce((sum, value) => sum + (value?.length ?? 0), 0);
      if (pending.length >= FLUSH_ROWS || pendingBytes >= FLUSH_BYTES) {
        await insertRows(target, table, columns, pending);
        copied += pending.length;
        pending = [];
        pendingBytes = 0;
      }
    }
    if (rows.length < FETCH_ROWS) break;
  }
  await insertRows(target, table, columns, pending);
  copied += pending.length;
  await source.query(`CLOSE ${cursor}`);
  return copied;
}

async function main(): Promise<void> {
  const sourceUrl = process.env.SOURCE_DATABASE_URL;
  const targetUrl = directDatabaseUrl(process.env);
  if (!sourceUrl) throw new Error(ERROR_MESSAGES.config.sourceDatabaseUrlMissing);
  if (!targetUrl) throw new Error(ERROR_MESSAGES.config.databaseUrlMissing);
  const truncate = process.argv.includes("--truncate");

  const source = connect(sourceUrl);
  const target = connect(targetUrl);
  await source.connect();
  await target.connect();
  try {
    const sourceTables = new Set(await listTables(source, SKIP_TABLES));
    const targetTables = new Set(await listTables(target, SKIP_TABLES));
    for (const table of sourceTables) {
      if (!targetTables.has(table)) throw new Error(ERROR_MESSAGES.config.copyTargetMissingTable(table));
    }
    const tables = [...sourceTables];

    const filled: string[] = [];
    for (const table of targetTables) if ((await countRows(target, table)) > 0) filled.push(table);
    if (filled.length > 0 && !truncate) throw new Error(ERROR_MESSAGES.config.copyTargetNotEmpty(filled.join(", ")));

    await source.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    await target.query("BEGIN");
    try {
      await target.query("SET LOCAL statement_timeout = 0");
      const foreignKeys = await listForeignKeys(target);
      for (const fk of foreignKeys) {
        await target.query(`ALTER TABLE ${ident(fk.table)} DROP CONSTRAINT ${ident(fk.name)}`);
      }
      if (filled.length > 0) await target.query(`TRUNCATE ${[...targetTables].map(ident).join(", ")}`);

      for (const table of tables) {
        const copied = await copyTable(source, target, table);
        console.log(`copied ${table.padEnd(32)} ${copied} rows`);
      }

      for (const fk of foreignKeys) {
        await target.query(`ALTER TABLE ${ident(fk.table)} ADD CONSTRAINT ${ident(fk.name)} ${fk.definition}`);
      }
      for (const serial of await listSerialColumns(target)) {
        await target.query(
          `SELECT setval($1, COALESCE((SELECT MAX(${ident(serial.column)}) FROM ${ident(serial.table)}), 1),
                  (SELECT MAX(${ident(serial.column)}) FROM ${ident(serial.table)}) IS NOT NULL)`,
          [serial.sequence],
        );
      }
      for (const table of tables) {
        const [from, to] = [await countRows(source, table), await countRows(target, table)];
        if (from !== to) throw new Error(ERROR_MESSAGES.config.copyCountMismatch(table, from, to));
      }
      await target.query("COMMIT");
      await source.query("COMMIT");
      console.log(`done: ${tables.length} tables copied and verified`);
    } catch (error) {
      await target.query("ROLLBACK").catch(() => undefined);
      await source.query("ROLLBACK").catch(() => undefined);
      throw error;
    }
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
