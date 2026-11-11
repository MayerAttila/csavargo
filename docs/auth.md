# Hitelesítés

## Felépítés

Better Auth 1.7.19 fut a Fastify backendben. PostgreSQL tárolja a felhasználókat, munkameneteket,
fiókokat, visszaállítási adatokat és sebességkorlátokat. A meglévő `UserProfile` tábla megmarad,
az új hitelesítés nem használja. A jelszavakat a Better Auth saját jelszóhashelése kezeli.

A Next.js az `/api/*` kéréseket a privát Fastify szerverre továbbítja. A böngésző nem tárol tokent
localStorage-ban. A munkamenetsüti HttpOnly, SameSite=Lax; éles környezetben Secure.
A munkamenet hét napig érvényes, napi megújítással; a visszaállítási hivatkozás egy óráig,
a megerősítő hivatkozás 24 óráig. A jelszó-visszaállítás az összes munkamenetet visszavonja.

A regisztráció azonnal beléptet; a nem megerősített e-mail-cím nem akadályozza a hozzáférést.
Sikertelen levélküldés esetén a fiók megmarad; a felhasználó új levelet kérhet.
Az ismételt regisztráció jelezheti, hogy az e-mail-cím már foglalt. A jelszó-visszaállítás kérése
azonos választ ad létező és ismeretlen címekre.

## Konfiguráció

| Alkalmazás | Változó | Fejlesztői érték / szerep |
| --- | --- | --- |
| API | `DATABASE_URL` | PostgreSQL kapcsolati URL; futáskor és migrációhoz kötelező |
| API | `BETTER_AUTH_SECRET` | Véletlen, legalább 32 karakteres titok |
| API | `BETTER_AUTH_URL` | Nyilvános frontend origin: `http://localhost:3000` |
| API | `WEB_ORIGIN` | Engedélyezett frontend origin: `http://localhost:3000` |
| API | `MAIL_PROVIDER` | `smtp` fejlesztéshez, `resend` éles környezethez |
| API | `MAIL_FROM` | `Csavargó <noreply@csavargo.local>`; élesben hitelesített feladó |
| API | `SMTP_HOST`, `SMTP_PORT` | `127.0.0.1`, `1025` |
| API | `RESEND_API_KEY` | Csak szerveren, éles levélküldéshez |
| API | `TRUSTED_PROXY` | Opcionális, vesszővel elválasztott megbízható proxy-IP/CIDR lista |
| Web | `API_INTERNAL_URL` | Privát API URL: `http://127.0.0.1:3001`; build és futás során egyezzen |

A titok előállítható: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
A titkokat ne commitold. A frontend `.env.local`, a backend `.env` fájlt használ.

## Adatbázis és szerződés

`pnpm --dir csavargo-api db:deploy` alkalmazza a verziózott migrációkat. Üres adatbázison létrehozza
a korábbi profiltáblát és az auth táblákat. Migrációtörténet nélküli meglévő `UserProfile` tábla esetén
ellenőrzi az oszlopokat, baseline-ként regisztrálja a korábbi sémát, majd hozzáadja az auth táblákat.
Eltérő profilséma esetén leáll; ilyenkor kézi sémaellenőrzés szükséges. Nem reseteli az adatbázist.
Üzembe helyezés előtt készíts adatbázismentést a meglévő üzemeltetési eljárás szerint.

A `GET /api/me` hitelesített választ ad: `{ user: { id, name, email, emailVerified } }`;
érvénytelen munkamenetnél `401`. A Zod-sémákból exportált OpenAPI a backend `contracts/openapi.v1.json`
fájljában van. A gyökér `pnpm contract:generate` parancsa frissíti ezt és a frontend generált típusait.
A Better Auth végpontjait a verzióazonos kliens kezeli; az üzleti szerződés nem másolja le őket.

## Éles üzem

1. Publikáld a backend és frontend commitokat, majd frissítsd a fő repository submodule-hivatkozásait.
2. Állítsd be az adatbázist, az egyetlen nyilvános HTTPS origint, az auth titkot és a Resend hitelesített feladóját/API-kulcsát.
3. A Fastify maradjon privát hálózaton. Az internetes ingress írja felül a kliens által küldött forwarding fejléceket;
   a `TRUSTED_PROXY` kizárólag a tényleges proxyhálózatokat engedje. Enélkül a limiter a közvetlen kapcsolat IP-jét használja,
   így a proxy mögötti felhasználók közös limitet kapnak. Ne engedélyezz minden proxyt.
4. Build előtt generáld a Prisma klienst; alkalmazd a migrációkat az új API indítása előtt.
5. A frontend build és futás ugyanazt az `API_INTERNAL_URL` értéket kapja. Az auth válaszok ne kerüljenek CDN-cache-be;
   minden `Set-Cookie` fejlécet és redirectet továbbítani kell.
6. Ellenőrizd a `/health` végpontot, regisztrációt, azonnali hozzáférést, levelet, megerősítést, visszaállítást és kijelentkezést.

Figyeld a `auth_mail_failed` eseményeket, a hitelesítési 5xx és 429 válaszokat. A naplók nem tartalmazhatnak
jelszót, sütit vagy e-mail-hivatkozásban lévő tokent. Ebben a kiadásban a levélküldés újrakéréssel ismételhető;
nincs háttérsoros automatikus újrapróbálás.

## Tesztek

A CI PostgreSQL 17-tel futtatja az integrációs teszteket. A migrációteszt külön, ideiglenes adatbázist hoz létre és töröl,
ehhez a tesztfelhasználónak adatbázis-létrehozási jog kell. Éles adatbázis-URL nem használható.
A root CI Mailpittel és Chromium böngészővel ellenőrzi a teljes folyamatot; a nyomkövetés hibánál CI-artifact lesz.
Ezek szintetikus tesztfiókok adatait tartalmazhatják; az artifact megőrzése hét nap.
