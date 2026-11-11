# Csavargó 🧭

Magyar nyelvű közös utazástervező: útitervek, térképes helyszínek, költségmegosztás, foglalások és útitársak egy helyen.

**Állapot:** M1 – Foundation. A központi repository lokális infrastruktúrát és dokumentációt tartalmaz; az üzleti funkciók még fejlesztés alatt vannak.

## Repositoryk
- [csavargo](https://github.com/MayerAttila/csavargo) – project hub
- [csavargo-web](https://github.com/MayerAttila/csavargo-web) – Next.js frontend
- [csavargo-api](https://github.com/MayerAttila/csavargo-api) – Fastify backend

## Local setup
Klónozd a fő repositoryt a submodule-okkal (`git clone --recurse-submodules`), majd a gyökérkönyvtárban:

```bash
cp .env.example .env
docker compose up -d
```

Ez a PostgreSQL adatbázist és a Mailpit fejlesztői postaládát indítja. A frontend és backend együttes indítása a gyökérkönyvtárból:

```bash
pnpm install
pnpm --dir csavargo-api install
pnpm --dir csavargo-web install
pnpm --dir csavargo-api db:generate
pnpm --dir csavargo-api db:deploy
pnpm dev
```

Első indítás előtt másold a `csavargo-api/.env.example` fájlt `csavargo-api/.env`,
a `csavargo-web/.env.example` fájlt pedig `csavargo-web/.env.local` néven.

A Codex **Run** művelete ugyanezt a `pnpm dev` parancsot futtatja. Frontend:
http://localhost:3000 · Backend: http://localhost:3001/health.
A `Ctrl+C` mindkét fejlesztői szervert leállítja.

A VS Code `Tasks: Run Task` → `Run backend + frontend` művelete külön terminálban indítja a két alkalmazást.

## Bejelentkezés és e-mail

A `/regisztracio` oldalon névvel, e-mail-címmel és 8–128 karakteres jelszóval hozhatsz létre fiókot.
A regisztráció azonnal beléptet a `/attekintes` oldalra. Az e-mail-cím megerősítése opcionális;
az áttekintő oldalon új megerősítő levél kérhető. A `/belepes` oldalról jelszó-visszaállítás indítható.
A visszaállítás minden korábbi munkamenetet érvénytelenít.

A fejlesztői levelek a [Mailpit postaládában](http://localhost:8025) jelennek meg; nem mennek külső címzettekhez.
Az SMTP a `127.0.0.1:1025` címen érhető el. A böngésző az `/api` útvonalon, a frontenddel azonos originen hívja a Fastify API-t.

Windows alatt, ha a helyi natív PostgreSQL-klaszter már inicializálva van a `.local/postgres` könyvtárban,
a gép újraindítása után a fő repository gyökeréből így indítható újra:

```powershell
pg_ctl -D .local/postgres -l .local/postgres.log -o "-p 5432 -h 127.0.0.1" start
Start-Process -FilePath .local/bin/mailpit.exe -WindowStyle Hidden -ArgumentList '--listen','127.0.0.1:8025','--smtp','127.0.0.1:1025'
```

A `.local` könyvtár helyi adatokat és futtatható fájlokat tartalmaz, Git által ignorált. Ez a Docker Compose helyi alternatívája;
a két PostgreSQL-példányt ne indítsd egyszerre ugyanazon a porton. A backend `.env` kapcsolati adatai egyezzenek a használt adatbázissal.

Részletes konfiguráció és üzembe helyezés: [auth útmutató](docs/auth.md).

## Ellenőrzés

```bash
pnpm --dir csavargo-api lint
pnpm --dir csavargo-api typecheck
pnpm --dir csavargo-api test
pnpm --dir csavargo-api build
pnpm --dir csavargo-web lint
pnpm --dir csavargo-web typecheck
pnpm --dir csavargo-web test:unit
pnpm --dir csavargo-web build
pnpm contract:generate
```

Az adatbázisos tesztekhez és a Playwright-folyamathoz külön, `_test` végű adatbázis szükséges.
Az `AUTH_TEST_DATABASE_URL` hiányában a backend adatbázisos tesztjei kimaradnak; a CI mindig futtatja őket.

```powershell
docker compose exec postgres createdb -U csavargo csavargo_auth_test
$env:AUTH_TEST_DATABASE_URL = 'postgresql://csavargo:change_me_local_only@127.0.0.1:5432/csavargo_auth_test'
$env:DATABASE_URL = $env:AUTH_TEST_DATABASE_URL
pnpm --dir csavargo-api db:deploy
pnpm --dir csavargo-api test
pnpm exec playwright install chromium
pnpm test:e2e
```

A böngészőtesztek saját szervereket indítanak a `3100` és `3101` porton. A `MAILPIT_URL` és `SMTP_PORT` változókkal
eltérő tesztpostaláda is megadható. A tesztadatbázis sebességkorlátjai érvényesek; gyors ismétlés előtt várj egy percet.

## Design
Brand: `#3B82F6` · Accent: `#10B981` · Light: `#F3F4F6` · Dark: `#222226`

## Architecture
- [System architecture](docs/architecture/system.md)
- [Repository structure ADR](docs/decisions/001-repository-structure.md)

Never commit credentials or production data.
