# Csavargó 🧭

Magyar nyelvű közös utazástervező: útitervek, térképes helyszínek, költségmegosztás, foglalások és útitársak egy helyen.

**Állapot:** M1 – Foundation. A központi repository lokális infrastruktúrát és dokumentációt tartalmaz; az üzleti funkciók még fejlesztés alatt vannak.

## Repositoryk
- [csavargo](https://github.com/MayerAttila/csavargo) – project hub
- [csavargo-web](https://github.com/MayerAttila/csavargo-web) – Next.js frontend
- [csavargo-api](https://github.com/MayerAttila/csavargo-api) – Fastify backend

## Local setup
Klónozd a három repositoryt ugyanabba a szülőmappába, majd ebben a repositoryban:

```bash
cp .env.example .env
docker compose up -d
```

Ez a PostgreSQL adatbázist indítja. A frontend és backend együttes indítása a gyökérkönyvtárból:

```bash
pnpm install
pnpm --dir csavargo-api install
pnpm --dir csavargo-web install
pnpm dev
```

Első indítás előtt másold a `csavargo-api/.env.example` fájlt `csavargo-api/.env`,
a `csavargo-web/.env.example` fájlt pedig `csavargo-web/.env.local` néven.

A Codex **Run** művelete ugyanezt a `pnpm dev` parancsot futtatja. Frontend:
http://localhost:3000 · Backend: http://localhost:3001/health.
A `Ctrl+C` mindkét fejlesztői szervert leállítja.

## Design
Brand: `#3B82F6` · Accent: `#10B981` · Light: `#F3F4F6` · Dark: `#222226`

## Architecture
- [System architecture](docs/architecture/system.md)
- [Repository structure ADR](docs/decisions/001-repository-structure.md)

Never commit credentials or production data.
