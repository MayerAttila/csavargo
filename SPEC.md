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
I.map: `/terkep`; MapPoint `{id,label,coordinates:[longitude,latitude],address?,source?}`; controlled MapCanvas + camera commands; public `NEXT_PUBLIC_MAPBOX_TOKEN`.
I.trip: `/utazasok`; one destination + inclusive calendar date range + ordered MapPoint lists by date; page memory only.

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
V13: one app-wide React Hot Toast; shared success/error/loading/promise API; automatic safe query/mutation/page errors; form validation/outcomes toast-only + aria-invalid; navigation success notice one-shot/static code only; blocked storage never blocks navigation.
V14: auth errors use known safe codes + HTTP status + operation-specific Hungarian fallback; origin/name/unavailable failures have machine codes; internal server messages never displayed.
V15: root/VS Code development startup ensures DB + SMTP availability and migrations before backend; service startup idempotent.
V16: shared Input type selects native type/icon/floating label/autocomplete; name → text; accessible label floats on focus/value; password toggle preserves value/no submit; native props/ref forwarded; errors toast-only; reduced-motion honored.
V17: sidebar only inside protected shell; desktop rail expands on hover/focus and can pin; mobile modal traps focus/closes Escape/navigation/desktop resize; inactive future routes never navigate; logout clears private queries; theme controls deterministic before hydration.
V18: `/terkep` protected; reusable map independent of auth/demo/business storage; points memory-only; Budapest zoom11 + 3 manual fixtures; reset restores fixtures/view.
V19: Mapbox client-only; one instance/mount; listeners/markers/observer disposed; style/theme changes preserve camera/points; resize follows container; 2D; attribution visible.
V20: Search Box suggest/retrieve ≥3 chars, 350ms debounce, ≤5 results, hu, per-session UUID; abort/stale responses ignored; no persistent search data; safe Hungarian errors; geolocation explicit opt-in.
V21: missing token → configuration state; public pk token only; invalid token/network/limit/WebGL → safe distinct toast + retry; keyboard search/markers; responsive place panel.
V22: map host retains full panel width/height after vendor `.mapboxgl-map` class; desktop/mobile browser geometry >0; CSS-layer precedence cannot collapse host.
V23: selected place shows only provider-backed rating/hours/relative price/contact; missing → Hungarian no-data; safe HTTP(S) links; no invented prices/current-open state; sample lookup exact name + ≤500m, name/city query + proximity; cancel stale lookup; metadata memory-only.
V24: map POI hit → named place selection + optional `onPlaceSelect`; custom point only on background; Standard `poi` target/legacy satellite POI layers; preserve feature coordinates; stable ids + existing-place reuse; map-place metadata match ≤100m; hover cursor + listeners disposed.
V25: protected trip planner → inclusive valid date range; active-date points only; explicit add from search or POI; same place ≤1/date; manual reorder/remove; range edits preserve overlap + confirm dropping populated dates; destination change preserves stops; reload clears draft.

## §T
id|status|task|cites
---|---|---|---
T1|x|backend schema/auth/mail/API + integration tests|V1,V2,V3,V4,V5,V6,V8,V9,I.auth,I.me,I.env
T2|x|frontend auth pages/proxy/dashboard + tests|V3,V5,V7,V8,I.web,I.auth,I.me
T3|x|Mailpit/E2E/CI/docs; verify; commit repos + pointers|V1,V2,V3,V4,V5,V6,V7,V8,V9,I.env
T4|x|auth form POST + hydration guard; SSR/browser regressions; leave uncommitted|V1,V10,I.web,I.auth
T5|x|confirm session; fresh protected-page/logout navigation; leave uncommitted|V1,V7,V11,I.web,I.auth
T6|x|split public/protected route groups; shared server guard; leave uncommitted|V1,V7,V12,I.web
T7|x|app-wide notifications + query/mutation/page errors + cross-navigation auth notices; leave uncommitted|V5,V11,V13,I.web
T8|x|specific auth errors in forms/toasts; backend error codes; leave uncommitted|V5,V14,I.auth,I.web
T9|x|remove duplicate inline form/dashboard notices; validation via toast; leave uncommitted|V5,V13,I.web
T10|x|automatic local services + migrations before backend; verify live auth; leave uncommitted|V1,V6,V15,I.env
T11|x|typed reusable Input + icons/floating labels/password toggle; auth integration; leave uncommitted|V10,V13,V16,I.web
T12|x|add original Csavargó logo asset; shared Brand + tab icon; leave uncommitted|V5,I.web
T13|x|KEMP-style protected sidebar + mobile dialog/theme/user/logout; leave uncommitted|V1,V7,V11,V12,V13,V17,I.web
T14|x|reusable map/search + protected explorer + tests/docs; leave uncommitted; real map/search verified; satellite requests returned provider 429|V12,V13,V16,V18,V19,V20,V21,I.map
T15|x|inline selected-place metadata + lazy sample matching; 68 tests + lint/types + live desktop/mobile; leave uncommitted|V5,V13,V20,V23,I.map
T16|x|native POI click selection before custom-point fallback; dedupe/enrich; 70 tests + lint/types + live browser; leave uncommitted|V19,V20,V23,V24,I.map
T17|x|trip planner destination + calendar range + daily map/list; 74 unit + 5 browser tests; leave uncommitted|V5,V12,V16,V17,V19,V20,V21,V24,V25,I.trip,I.map

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
B8|2026-11-12|root tasks started API without DB after reboot; auth limiter query failed|service startup dependency; V15
B9|2026-11-12|sidebar test matched hidden mobile profile as well as desktop profile|scope query to desktop sidebar; V17
B10|2026-11-12|resolved theme changed sidebar label/icon during first client render|hydration-safe theme snapshot; V17
B11|2026-11-12|profile avatar used 28px column while nav icons used 32px|shared icon slot aligns profile/avatar/text; V17
B12|2026-11-12|Mapbox SetStyleOptions requires font fields; theme reloaded style unnecessarily|configure on style.load + theme update; V19; typecheck
B13|2026-11-12|place-list test expected aria-hidden marker number in accessible name|query visible place name; V21
B14|2026-11-12|existing Next server mixed cached layout with rebuilt client chunks during smoke test|fresh build server on isolated port; zero hydration errors; V19
B15|2026-11-12|unlayered Mapbox CSS overrode Tailwind absolute positioning; map host collapsed to 0px|explicit full host dimensions + browser geometry regression; V22
B16|2026-11-12|full postal sample query suppressed exact POI suggestion|name + city/proximity; exact name + distance guard; V23
B17|2026-11-12|all map clicks invoked custom-point callback; basemap POIs never queried|POI hit-test before background handler; V24
B18|2026-11-12|undeclared transitive GeoJSON types + modulo on in-range longitude affected POI tests|runtime geometry validation + preserve in-range coordinates; V24
