# Deployment (Vercel + Supabase Postgres)

Rooq is a single Next.js 16 app: the storefront, `/admin` and `/api/v1`. It
deploys as one Vercel project. The only external dependency is a Postgres
database (Supabase). Images live in that database, so there is no object
storage to configure. Prisma stays the ORM; Supabase is just the Postgres host.

## 1. Database (Supabase)

1. Create a Supabase project (supabase.com, or Vercel → Storage → Supabase), in
   the region closest to your Vercel functions. Make sure it is **active**
   (not paused or suspended).
2. Connection strings (Supabase → Connect):
   - `DATABASE_URL` = **transaction pooler**, port `6543`
     (`postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`).
     Serverless functions open many short connections; the pooler keeps them
     under the database limit.
   - `DIRECT_URL` = **session pooler** (or direct host), port `5432`, used by
     `prisma migrate`, `pnpm db:migrate:pg` and `pnpm db:copy`.
   - Both use the `rooq` role (`rooq.<ref>`) and end in `&schema=rooq`. The
     integration's `POSTGRES_*` URLs are never read.
3. `sslmode=require` keeps the connection encrypted. node-postgres would treat
   it as `verify-full` and reject Supabase's own CA, so the app adds
   `uselibpqcompat=true` (libpq semantics) for you.
4. **Own role + schema.** Rooq lives in schema `rooq`, owned by role `rooq`
   (`search_path = rooq`), not in `public`: Supabase's Data API exposes
   `public` to the anon key, and the app does not need the admin `postgres`
   role. One-off setup, as the `postgres` role:

   ```sql
   CREATE ROLE rooq LOGIN PASSWORD '<strong password>';
   GRANT rooq TO postgres;
   CREATE SCHEMA rooq AUTHORIZATION rooq;
   ALTER ROLE rooq SET search_path = rooq;
   GRANT CREATE ON DATABASE postgres TO rooq; -- the init migration runs CREATE SCHEMA IF NOT EXISTS
   ```

   `?schema=rooq` makes Prisma's generated queries target `rooq`
   (`lib/server/prisma-client.ts`); the role's `search_path` covers raw SQL.
5. Use a separate project (or branch) for Preview deployments. Previews must never write to production.

## 2. Vercel project

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | the repository root (this app) |
| Install command | `pnpm install` (runs `prisma generate` via `postinstall`) |
| Build command | `pnpm build` (= `prisma generate && next build`) |
| Output | default (`.next`) |
| Node.js version | 20.x or newer (24 recommended) |
| Function region | same region as the database |

Set the environment variables from [environment-variables.md](environment-variables.md)
for **Production** and **Preview** separately. At minimum set `DATABASE_URL`
and `DIRECT_URL` (the `rooq` role URLs),
`JWT_SECRET`, `NEXT_PUBLIC_APP_URL` and
`NEXT_PUBLIC_SITE_URL`. `NEXT_PUBLIC_*` values are baked in at build time, so
redeploy after changing them.

CLI deploys (`vercel --prod`) skip `.env`, `data/` and `references/` via
`.vercelignore`, so local secrets and seed photos are never uploaded.

The generated Prisma client (`lib/generated/prisma`) is git-ignored and is
rebuilt on every install/build, so a schema change only needs a new migration.
There is no generated code to commit.

## 3. Migrations

Migrations live in `prisma/migrations` and are applied with
`prisma migrate deploy`, which only runs migrations that are not applied yet and never resets data:

```bash
DIRECT_URL="<session pooler url>" pnpm db:migrate:deploy
```

Recommended: run it as a **release step** before (or right after) promoting a
deployment, from CI or your machine. If you prefer it automatic, override the
Production build command with `pnpm db:migrate:deploy && pnpm build`. Keep
the Preview build command as `pnpm build`, so a preview branch can never
migrate production.

If Prisma's schema engine cannot reach the database from your network (error
`P1001`), `pnpm db:migrate:pg` applies the same pending migrations through the
`pg` driver and records them in `_prisma_migrations` exactly like `migrate deploy`.

Never run `prisma migrate dev` or `prisma db push` against production.

## 3b. Moving data from another Postgres (e.g. the old Prisma Postgres)

```bash
pnpm db:migrate:pg                # schema on the new database first
SOURCE_DATABASE_URL="<old url>" pnpm db:copy
```

`db:copy` copies every table (images in `media_blobs` included) into
`DIRECT_URL` in one transaction, then compares row counts before it commits.
It refuses a target that already has rows; `--truncate` replaces them. Media
ids do not change, so every `/api/v1/media/<id>` URL keeps working.

## 4. Seed (first deploy only)

```bash
DATABASE_URL="<production url>" SEED_ADMIN_EMAIL="you@your-domain" SEED_ADMIN_PASSWORD="<strong password>" pnpm db:seed
```

The seed is idempotent. It creates the roles (`superadmin`, `admin`, `user`),
the staff account, the size and colour masters, the category tree and a demo
fashion catalogue. Sign in at `/admin/login` and change the password straight
away. Skip or prune the demo catalogue for a real launch.

## 5. sharp on Vercel

Image uploads are processed with [sharp](https://sharp.pixelplumbing.com)
(WebP, 1600 px long edge, quality 80).

- sharp ships prebuilt binaries per platform (`@img/sharp-linux-x64` on Vercel).
  Vercel installs on Linux, so the right binary is picked automatically. Do not
  commit `node_modules`, and do not install with `--no-optional`.
- `pnpm-workspace.yaml` allows sharp's build step (`allowBuilds`), and
  `next.config.ts` keeps it out of the bundle (`serverExternalPackages`).
- Uploads run in the Node.js runtime (route handlers default to it). Do not set
  `export const runtime = "edge"` on routes that touch sharp, Prisma or bcrypt.
- **Request body limit.** Vercel Functions accept request bodies up to **4.5 MB**.
  The app accepts uploads up to 5 MB (`MAX_UPLOAD_MB` in `lib/constants/media.ts`),
  so a file between 4.5 and 5 MB is rejected by Vercel with `413` before it
  reaches the app. Either lower `MAX_UPLOAD_MB` to 4, or resize images in the
  browser before upload.

## Media caching

`GET /api/v1/media/[id]` answers with
`Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable` and an `ETag` (the sha256
checksum), and returns `304` for a matching `If-None-Match`. An id's bytes never
change (a new upload gets a new id), so this is safe to cache forever.

- **Browsers** cache each image for a year.
- **`next/image`** does not use `/_next/image`. A custom loader
  (`utils/image-loader.ts`) turns each srcset entry into
  `/api/v1/media/<id>?w=<width>`; the route resizes with sharp (WebP, q75,
  never upscaled) and the CDN caches every width. No Image Optimization quota,
  no extra function hop.
- **Vercel's CDN** caches the response (`s-maxage`), so repeat requests are
  served from the edge without invoking the function or reading the database.
- **Each function instance** keeps recently served bytes in a 64 MB memory LRU
  (`MEDIA_MEMORY_CACHE_BYTES`); a cache miss costs one database round trip.
- Stored images are capped at 250 KB (`IMAGE_MAX_BYTES`). Older, larger rows
  can be re-encoded in place with
  `pnpm exec tsx --conditions=react-server scripts/compress-media.ts [--dry-run]`.

Database size grows by roughly 100–250 KB per uploaded image. Watch the
Supabase database size quota (500 MB on the free plan), and keep backups
(Supabase backups, or `pg_dump`; the dump includes every image).

## 6. Connection handling

- One `PrismaClient` per function instance (`lib/server/prisma.ts`), on a `pg` pool.
- Serverless functions can scale out to many instances. Each holds its own small
  pool, so keep an eye on the database connection limit. If you hit it, cap the
  pool size (the `pg` pool `max` option passed to `PrismaPg` in
  `lib/server/prisma-client.ts`, `DATABASE_POOL_MAX`). In production `DATABASE_URL`
  must be Supabase's transaction pooler (port 6543), never the direct host.
- Long work belongs in a single transaction (`prisma.$transaction`). Do not hold
  connections across awaits on slow third-party calls.

## 7. Checklist

- [ ] Supabase project active; `DATABASE_URL` (pooler 6543) and `DIRECT_URL` (5432) set per environment
- [ ] `JWT_SECRET` set (different per environment)
- [ ] `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` set to the real domain
- [ ] `pnpm db:migrate:deploy` run against production
- [ ] Data copied with `pnpm db:copy` (or `pnpm db:seed` run once on a fresh database); staff password changed
- [ ] Resend domain verified and `RESEND_*` / `STORE_EMAIL` set (otherwise mail is a logged dry run)
- [ ] Google OAuth origins include the production domain (if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set)
- [ ] Upload a test image in the admin and open its `/api/v1/media/<id>` URL; check the `Cache-Control` and `ETag` headers
- [ ] `/admin` redirects to `/admin/login` when signed out (`proxy.ts`)

## Rollback

Vercel → Deployments → promote the previous deployment. Migrations are
forward-only: if a release added a migration, ship a new migration that undoes it
rather than editing an applied one.
