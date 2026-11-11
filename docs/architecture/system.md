# Csavargó system architecture

Three independent repositories:

- [csavargo-web](https://github.com/MayerAttila/csavargo-web): Next.js, React, Tailwind CSS 4, React Icons, MUI X Charts, React Hot Toast, TanStack Query and Mapbox.
- [csavargo-api](https://github.com/MayerAttila/csavargo-api): Fastify, Zod, Prisma, PostgreSQL, Better Auth.
- **csavargo**: developer entry point, Docker Compose, architectural decisions, and product documentation.

The browser calls `/api/*` on the Next.js origin over HTTPS in production. Next.js proxies requests to the private Fastify service. The API owns authentication, authorization, business rules, and data. The initial system is a modular monolith.

## Local development

The root repository contains the web and API as Git submodules. Start PostgreSQL and Mailpit with `docker compose up -d`, apply API migrations, then run root `pnpm dev` or the VS Code tasks.

## API contract

Fastify/Zod schemas are the source of truth. The API exports `contracts/openapi.v1.json`; root `pnpm contract:generate` regenerates frontend TypeScript types with `openapi-typescript`. The initial authenticated business endpoint is `GET /api/me`. Better Auth's own routes use its version-aligned client rather than duplicated DTOs.

Auth uses PostgreSQL-backed sessions and rate limits, optional email verification, and session revocation on password reset. Hungarian React Email templates are delivered through SMTP/Mailpit locally and Resend in production. See [auth setup](../auth.md).
