# Csavargó system architecture

Three independent repositories:

- [csavargo-web](https://github.com/MayerAttila/csavargo-web): Next.js, React, Tailwind CSS 4, React Icons, MUI X Charts, React Hot Toast, TanStack Query and Mapbox.
- [csavargo-api](https://github.com/MayerAttila/csavargo-api): Fastify, Zod, Prisma, PostgreSQL, Better Auth (planned).
- **csavargo**: developer entry point, Docker Compose, architectural decisions, and product documentation.

The browser calls the API over HTTPS in production. The API owns business rules and data. The initial system is a modular monolith, not microservices.

## Local development

Place the three repositories in sibling directories. Start PostgreSQL with `docker compose up -d` here, then follow the API and web README files.

## API contract

Fastify/Zod schemas are the source of truth. The API exports an OpenAPI document. The web repository generates Typescript types with `openapi-typescript` from a **versioned** API contract; no duplicate handwritten shared DTOs. Contract generation is a planned M1 deliverable, not implemented in the bootstrap scaffold.
