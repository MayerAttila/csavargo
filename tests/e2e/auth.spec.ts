import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function mailLink(request: APIRequestContext, email: string, subject: string, kind: "verification" | "reset") {
  const inbox = process.env.MAILPIT_URL ?? "http://127.0.0.1:8025";
  let messageId = "";
  await expect.poll(async () => {
    const result = await request.get(`${inbox}/api/v1/messages`);
    const data = await result.json();
    const message = data.messages.find((item: { ID: string; Subject: string; To: { Address: string }[] }) =>
      item.Subject.includes(subject) && item.To.some((to) => to.Address === email));
    messageId = message?.ID ?? "";
    return !!messageId;
  }, { timeout: 15000 }).toBe(true);
  const response = await request.get(`${inbox}/api/v1/message/${messageId}`);
  const message = await response.json();
  const links = String(message.Text).match(/https?:\/\/[^\s<>]+/g) ?? [];
  const link = links.find((url) => url.includes(kind === "verification" ? "/verify-email?" : "/reset-password/"));
  expect(link).toBeTruthy();
  return link!;
}

test("anonymous dashboard redirects before showing private content", async ({ page }) => {
  await page.goto("/attekintes");
  await expect(page).toHaveURL(/\/belepes$/);
  await expect(page.getByRole("heading", { name: "Üdv újra!" })).toBeVisible();
});

test("complete Hungarian email auth lifecycle", async ({ page, request, browser }) => {
  const email = `e2e-${randomUUID()}@example.com`;
  const password = "Csavargo-e2e-password-123";
  const nextPassword = `${password}-new`;
  await page.goto("/regisztracio");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.screenshot({ path: "test-results/auth-register-mobile-dark.png", fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.getByLabel("Név", { exact: true }).fill("Teszt Utazó");
  await page.getByLabel("E-mail-cím", { exact: true }).fill(email);
  await page.getByLabel("Jelszó", { exact: true }).fill(password);
  await page.getByLabel("Jelszó megerősítése", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Regisztráció", exact: true }).click();
  await expect(page).toHaveURL(/\/attekintes$/);
  await expect(page.getByRole("heading", { name: "Szia, Teszt Utazó!" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Erősítsd meg az e-mail-címedet" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Szia, Teszt Utazó!" })).toBeVisible();
  const me = await page.request.get("/api/me");
  expect(me.status()).toBe(200);
  expect((await me.json()).user.emailVerified).toBe(false);
  const browserCookies = await page.context().cookies();
  expect(browserCookies.some((cookie) => cookie.name.includes("session_token") && cookie.httpOnly)).toBe(true);
  const verification = await mailLink(request, email, "Erősítsd", "verification");
  await page.goto(verification);
  await expect(page.getByRole("heading", { name: "E-mail-cím megerősítve" })).toBeVisible();
  await page.goto("/attekintes");
  await expect(page.getByText("E-mail-cím megerősítve", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Kijelentkezés" }).click();
  await expect(page).toHaveURL(/\/belepes$/);
  await page.getByLabel("E-mail-cím", { exact: true }).fill(email);
  await page.getByLabel("Jelszó", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Belépés", exact: true }).click();
  await expect(page).toHaveURL(/\/attekintes$/);
  const savedSession = await page.context().storageState();
  await page.goto("/elfelejtett-jelszo");
  await page.getByLabel("E-mail-cím", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Hivatkozás küldése" }).click();
  await expect(page.getByRole("status")).toContainText("Ha ehhez az e-mail-címhez tartozik fiók");
  await page.goto(await mailLink(request, email, "Új jelszó", "reset"));
  await expect(page).toHaveURL(/\/uj-jelszo\?token=/);
  await page.getByLabel("Jelszó", { exact: true }).fill(nextPassword);
  await page.getByLabel("Jelszó megerősítése", { exact: true }).fill(nextPassword);
  await page.getByRole("button", { name: "Jelszó mentése" }).click();
  await expect(page).toHaveURL(/\/belepes\?jelszo=frissitve$/);
  const oldSession = await browser.newContext({ storageState: savedSession });
  try { expect((await oldSession.request.get("http://localhost:3100/api/me")).status()).toBe(401); }
  finally { await oldSession.close(); }
  await page.getByLabel("E-mail-cím", { exact: true }).fill(email);
  await page.getByLabel("Jelszó", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Belépés", exact: true }).click();
  await expect(page.getByText("Hibás e-mail-cím vagy jelszó.", { exact: true })).toBeVisible();
  await page.getByLabel("Jelszó", { exact: true }).fill(nextPassword);
  await page.getByRole("button", { name: "Belépés", exact: true }).click();
  await expect(page).toHaveURL(/\/attekintes$/);
  await page.screenshot({ path: "test-results/auth-dashboard-desktop.png", fullPage: true });
});
