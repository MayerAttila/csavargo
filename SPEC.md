# Csavargó auth

## §G
Hungarian email auth; immediate dashboard access; optional verification.

## §C
Fastify + Better Auth 1.7.19 + Prisma 7/PostgreSQL. Next.js 16 custom Tailwind UI.
Same-origin proxy. Mailpit dev; Resend production. Existing UserProfile data preserved.

## §I
I.auth: `/api/auth/*` → Better Auth client/server contract.
I.me: `GET /api/me` → `{user:{id,name,email,emailVerified}}`; unauthenticated → 401.
I.web: `/belepes`, `/regisztracio`, `/elfelejtett-jelszo`, `/uj-jelszo`, `/email-megerosites`, `/attekintes`.
I.env: public auth origin; private backend URL; DB URL; auth secret; SMTP/Resend sender.

## §V
V1: Fastify guard checks DB session; unverified users allowed; expired/revoked sessions rejected.
V2: passwords 8–128 chars; reset ≤1h; verification ≤24h; reset revokes sessions.
V3: cookies HttpOnly/Lax; Secure production; no browser token storage; proxy preserves all Set-Cookie.
V4: auth trusted origins explicit; DB rate limits 100/min; sensitive auth routes 5/min.
V5: UI/email Hungarian; safe error mapping; generic reset confirmation; registration survives mail failure.
V6: UserProfile preserved; auth migration additive; no destructive DB reset.
V7: server-rendered dashboard protected/no cache; logout clears private query cache.
V8: /api/me Zod/OpenAPI source; web types generated; health tests independent of DB.
V9: auth request logs redact token path segments & query values.
V10: auth forms POST; controls disabled before hydration; credentials never submitted through native GET fallback.
V11: login/signup confirms fresh session before full `/attekintes` navigation; logout clears private queries before full `/belepes` navigation.
V12: `(public)`/`(protected)` groups preserve URLs; protected layout + private-data pages require server session; memoization scoped to server request.

## §T
id|status|task|cites
---|---|---|---
T1|x|backend schema/auth/mail/API + integration tests|V1,V2,V3,V4,V5,V6,V8,V9,I.auth,I.me,I.env
T2|x|frontend auth pages/proxy/dashboard + tests|V3,V5,V7,V8,I.web,I.auth,I.me
T3|x|Mailpit/E2E/CI/docs; verify; commit repos + pointers|V1,V2,V3,V4,V5,V6,V7,V8,V9,I.env
T4|x|auth form POST + hydration guard; SSR/browser regressions; leave uncommitted|V1,V10,I.web,I.auth
T5|x|confirm session; fresh protected-page/logout navigation; leave uncommitted|V1,V7,V11,I.web,I.auth
T6|x|split public/protected route groups; shared server guard; leave uncommitted|V1,V7,V12,I.web

## §B
id|date|cause|fix
---|---|---|---
B1|2026-11-10|Prisma generation required DB env despite no connection|config fallback; runtime env mandatory; V8
B2|2026-11-10|React Email imports need direct React dependency under pnpm|declare react + types; V5
B3|2026-11-10|Prisma package default export points at types-only file|invoke CLI entry explicitly; V6
B4|2026-11-10|Better Auth cookie-free login skips foreign Origin rejection|explicit adapter origin guard; V4
B5|2026-11-10|reset token embedded in path survived query stripping|redact token path; V9
B6|2026-11-11|Playwright alert selector also matched Next route announcer|target exact Hungarian error text; V5
B7|2026-11-11|auth form default GET allowed pre-hydration submission; credentials entered URL/logs; API bypassed|POST + hydration guard; V10
