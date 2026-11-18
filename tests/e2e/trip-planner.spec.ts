import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("V25: the protected planner uses a calendar range on desktop and mobile", async ({ page, baseURL }) => {
  await page.route("https://*.mapbox.com/**", (route) => route.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/utazasok");
  await expect(page).toHaveURL(/\/belepes$/);

  const signup = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: baseURL! },
    data: { name: "Kiránduló", email: `trip-${randomUUID()}@example.test`, password: randomUUID() },
  });
  expect(signup.ok()).toBe(true);
  await page.goto("/attekintes");
  await page.getByRole("link", { name: "Utazások", exact: true }).click();
  await expect(page).toHaveURL(/\/utazasok$/);
  await expect(page.getByRole("link", { name: "Utazások", exact: true })).toHaveAttribute("aria-current", "page");

  const settings = page.getByRole("region", { name: "Úti cél és időtartam" });
  const map = page.getByRole("region", { name: "Interaktív térkép" });
  const start = page.getByLabel("Kezdő dátum");
  const end = page.getByLabel("Záró dátum");
  const daySelector = page.getByRole("group", { name: "Napválasztó" });
  await start.fill("2026-11-18");
  await end.fill("2026-11-20");
  await page.getByRole("button", { name: "Időszak beállítása" }).click();
  await expect(daySelector).toContainText("1. nap / 3");
  expect((await map.boundingBox())!.x).toBeGreaterThanOrEqual((await settings.boundingBox())!.x + (await settings.boundingBox())!.width);

  await page.setViewportSize({ width: 390, height: 844 });
  expect((await map.boundingBox())!.y).toBeGreaterThan((await settings.boundingBox())!.y + (await settings.boundingBox())!.height);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  const next = page.getByRole("button", { name: "Következő nap" });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(daySelector).toContainText("2026. november 19.");
  await page.reload();
  await expect(start).toHaveValue("");
  await expect(end).toHaveValue("");
  await expect(daySelector).toHaveCount(0);
});
