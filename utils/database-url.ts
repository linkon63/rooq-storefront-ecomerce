/**
 * Database URL helpers (pure). The app runs on Supabase Postgres: queries go
 * through the transaction pooler (port 6543), migrations and bulk copies
 * through the session pooler (port 5432). Rooq lives in its own schema and
 * role (`?schema=rooq`, user `rooq.<project-ref>`), so the integration's
 * POSTGRES_* URLs (the shared `postgres` role) are deliberately never used.
 */
type Env = Readonly<Record<string, string | undefined>>;

const first = (...values: (string | undefined)[]): string | undefined =>
  values.find((value) => typeof value === "string" && value.trim() !== "");

/** URL for app queries. */
export function runtimeDatabaseUrl(env: Env): string | undefined {
  return first(env.DATABASE_URL);
}

/** URL for migrations and bulk work: DIRECT_URL, else DATABASE_URL. */
export function directDatabaseUrl(env: Env): string | undefined {
  return first(env.DIRECT_URL, env.DATABASE_URL);
}

/** Postgres schema named by the URL's `schema` param (Prisma's convention), if any. */
export function databaseSchema(url: string): string | undefined {
  try {
    return new URL(url).searchParams.get("schema") ?? undefined;
  } catch {
    return undefined;
  }
}

const LIBPQ_LIKE_MODES = new Set(["require", "prefer", "allow"]);

/**
 * node-postgres treats `sslmode=require` as `verify-full`, which rejects
 * Supabase's own root CA ("self-signed certificate in certificate chain").
 * Opting into libpq semantics keeps the connection encrypted without chain
 * verification — what psql and Prisma's CLI already do with the same URL.
 */
export function withLibpqSslMode(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const mode = parsed.searchParams.get("sslmode");
  if (!mode || !LIBPQ_LIKE_MODES.has(mode) || parsed.searchParams.has("uselibpqcompat")) return url;
  parsed.searchParams.set("uselibpqcompat", "true");
  return parsed.toString();
}
