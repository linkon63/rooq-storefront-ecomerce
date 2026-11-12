# Environment variables

Rooq reads its configuration from environment variables. Locally they live in
`.env`. Copy [`.env.example`](../.env.example), which holds placeholder values
only. On Vercel, set them under **Project → Settings → Environment Variables**.

> Never commit `.env`, and never paste real values into docs, issues or chat.
> This page lists **keys only**.

Rules worth knowing:

- Variables prefixed `NEXT_PUBLIC_` are **inlined into the browser bundle at
  build time**. They are public, and changing one needs a rebuild/redeploy.
- Everything else is server-only. It is read at runtime by route handlers,
  server components, the seed and scripts.
- Prisma CLI commands (`migrate`, `studio`, `db seed`) load `.env` through
  `prisma.config.ts` (`dotenv/config`).

## Required

| Key | Used by | What it is |
| --- | --- | --- |
| `DATABASE_URL` | Prisma (`lib/server/prisma-client.ts`, `prisma.config.ts`) | Postgres connection string. For Prisma Postgres use the direct TCP URL (`postgres://…@db.prisma.io:5432/postgres?sslmode=require`). Any Postgres 14+ works. Without it every database call fails with `ERROR_MESSAGES.config.databaseUrlMissing`. |
| `JWT_SECRET` | `lib/server/auth/jwt.ts`, `proxy.ts` | HS256 signing secret for access tokens. Use a long random string, e.g. `openssl rand -base64 48`. Rotating it signs everyone out. |
| `NEXT_PUBLIC_APP_URL` | password-reset and other e-mail links | Public origin of the app, e.g. `https://<your-domain>`. Locally `http://localhost:3002`. |

## Optional

| Key | Default | What it is |
| --- | --- | --- |
| `JWT_EXPIRES_IN` | `7d` | Access-token lifetime (any `jose` duration: `12h`, `7d`, …). |
| `NEXT_PUBLIC_SITE_URL` | `https://rooq.store` | Canonical site URL for metadata, `sitemap.xml`, `robots.txt` and back-in-stock e-mail links. Set it to the production domain. |
| `SEED_ADMIN_EMAIL` | `admin@rooq.local` | E-mail of the staff account `pnpm db:seed` creates. |
| `SEED_ADMIN_PASSWORD` | a placeholder (see `.env.example`) | First password of that account. **Always set your own** for any shared or production database, and change it after the first sign-in. |
| `RESEND_API_KEY` | unset = dry run | [Resend](https://resend.com) API key for transactional mail (password reset, order alerts, back-in-stock, contact form, newsletter). Without it, mail is logged instead of sent (`lib/server/mail/client.ts`). |
| `RESEND_FROM_EMAIL` | Resend onboarding sender | Sender, e.g. `Rooq <hello@your-domain>`. The domain must be verified in Resend. |
| `RESEND_TO_EMAIL` | unset | Inbox that receives newsletter sign-ups. |
| `STORE_EMAIL` | unset | Inbox for new-order alerts and contact-form messages. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | unset = Google button hidden | Google OAuth **web** client ID. It enables "Sign in with Google" on the storefront. Add your domains to the client's authorised JavaScript origins. |
| `NEXT_PUBLIC_GTM_ID` | unset = no tracking | Google Tag Manager container ID. |

`NODE_ENV` is set by Next.js itself. Do not set it by hand.

## Per environment

| Environment | Notes |
| --- | --- |
| Local | `cp .env.example .env`, fill `DATABASE_URL` and `JWT_SECRET`, keep the localhost URLs. |
| Vercel Production | All required keys plus `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` set to the real domain, Resend keys for real mail. |
| Vercel Preview | Point `DATABASE_URL` at a **separate** database (or a Prisma Postgres preview database), never at production. Use a different `JWT_SECRET` too. |

Adding a new variable? Add the key with a placeholder to `.env.example`, a row
here, and a row in the README's Installation table, all in the same change.
