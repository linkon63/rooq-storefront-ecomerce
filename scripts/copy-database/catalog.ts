import type pg from "pg";

/** Quotes a Postgres identifier. */
export const ident = (name: string): string => `"${name.replace(/"/g, '""')}"`;

export type ForeignKey = { table: string; name: string; definition: string };
export type SerialColumn = { table: string; column: string; sequence: string };

/** Base tables of the connection's current schema (search_path / role setting), minus the ones the copy must not touch. */
export async function listTables(client: pg.Client, skip: ReadonlySet<string>): Promise<string[]> {
  const { rows } = await client.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = current_schema() AND table_type = 'BASE TABLE' ORDER BY table_name`,
  );
  return rows.map((row) => row.table_name).filter((name) => !skip.has(name));
}

/** Writable (non-generated) columns of a table, in table order. */
export async function listColumns(client: pg.Client, table: string): Promise<string[]> {
  const { rows } = await client.query<{ attname: string }>(
    `SELECT a.attname FROM pg_attribute a
     JOIN pg_class c ON c.oid = a.attrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = current_schema() AND c.relname = $1
       AND a.attnum > 0 AND NOT a.attisdropped AND a.attgenerated = ''
     ORDER BY a.attnum`,
    [table],
  );
  return rows.map((row) => row.attname);
}

export async function listForeignKeys(client: pg.Client): Promise<ForeignKey[]> {
  const { rows } = await client.query<{ relname: string; conname: string; def: string }>(
    `SELECT c.relname, k.conname, pg_get_constraintdef(k.oid) AS def
     FROM pg_constraint k JOIN pg_class c ON c.oid = k.conrelid
     WHERE k.contype = 'f' AND k.connamespace = current_schema()::regnamespace`,
  );
  return rows.map((row) => ({ table: row.relname, name: row.conname, definition: row.def }));
}

export async function listSerialColumns(client: pg.Client): Promise<SerialColumn[]> {
  const { rows } = await client.query<{ table_name: string; column_name: string; seq: string | null }>(
    `SELECT table_name, column_name,
            pg_get_serial_sequence(quote_ident(table_name), column_name) AS seq
     FROM information_schema.columns
     WHERE table_schema = current_schema() AND column_default LIKE 'nextval(%'`,
  );
  return rows
    .filter((row): row is typeof row & { seq: string } => row.seq !== null)
    .map((row) => ({ table: row.table_name, column: row.column_name, sequence: row.seq }));
}

export async function countRows(client: pg.Client, table: string): Promise<number> {
  const { rows } = await client.query<{ n: string }>(`SELECT count(*)::text AS n FROM ${ident(table)}`);
  return Number(rows[0]?.n ?? 0);
}
