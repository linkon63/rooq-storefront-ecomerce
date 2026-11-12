# Rooq documentation

Rooq is a fashion e-commerce platform: storefront, admin panel and REST API in
one Next.js 16 app, backed by PostgreSQL through Prisma. Start with the
overview, then go to the part you are working on.

## Start here

| Doc | Read it when |
| --- | --- |
| [Overview](overview.md) | You are new: what Rooq is, the fashion feature list, the tech stack, folder conventions (`utils` = pure functions, `lib` = libraries/IO, one error-messages file, Redux, GSAP/three.js). |
| [Environment variables](environment-variables.md) | Setting up `.env` locally or on Vercel. Keys only, never values. |
| [Deployment](deployment.md) | Shipping to Vercel with Prisma Postgres: migrations, seed, sharp, media caching, checklist. |

## Reference

| Doc | Contents |
| --- | --- |
| [API reference](api.md) | Every `/api/v1` route with its method and auth requirement, plus the error, pagination and status-code conventions. |
| [Database design](database/README.md) | Every table by domain: purpose, key columns, every relationship with its cardinality and ON DELETE rule, indexes, enums, and the binary-image (Media + MediaBlob) design. |
| [ER diagram (draw.io)](database/rooq-erd.drawio) | Open in [app.diagrams.net](https://app.diagrams.net) or VS Code with the *Draw.io Integration* extension. |
| [Schema (DBML)](database/schema.dbml) | Paste into [dbdiagram.io](https://dbdiagram.io/d). |

## Architecture (for contributors)

| Doc | Contents |
| --- | --- |
| [Porting guide](architecture/porting-guide.md) | How a module is built: route handler → service → mapper, the `route()` / `withAuth()` wrappers, validation, media, pagination, Next 16 rules. |
| [Fashion API contract](architecture/fashion-api-contract.md) | Request and response shapes for products, variants, colours, sizes, size charts, collections, inventory, back-in-stock, reviews, returns. |
| [Storefront design](design/storefront-design.md) | The storefront's visual direction and design decisions. |

## Elsewhere in the repo

- [`README.md`](../README.md): installation, scripts and release notes.
- [`STYLE_GUIDE.md`](../STYLE_GUIDE.md): UI rules.
- [`AGENTS.md`](../AGENTS.md): Next.js 16 caveats; read `node_modules/next/dist/docs/` before changing framework code.
- [`prisma/schema.prisma`](../prisma/schema.prisma): the database source of truth.

## Keeping docs current

- A schema change (new migration) updates `database/rooq-erd.drawio`,
  `database/schema.dbml` and `database/README.md` in the same change.
- A new route updates [api.md](api.md); a new env variable updates
  `.env.example`, [environment-variables.md](environment-variables.md) and the README's Installation section.
