import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("V22: map container keeps its height with vendor CSS on desktop and mobile", async ({ page, baseURL }) => {
  // Geometry regression: use real app/vendor CSS without live Mapbox requests.
  await page.route("https://*.mapbox.com/**", (route) => route.abort());
  await page.goto("/terkep");
  await expect(page).toHaveURL(/\/belepes$/);
  const signup = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: baseURL! },
    data: { name: "Térkép Elrendezés", email: `map-layout-${randomUUID()}@example.test`, password: randomUUID() },
  });
  expect(signup.ok()).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/terkep");
  const region = page.getByRole("region", { name: "Interaktív térkép" });
  const host = region.locator(":scope > div").first();
  // Mapbox adds this class during initialization, even when CI has no token.
  await host.evaluate((element) => element.classList.add("mapboxgl-map"));
  await expect(host).toHaveCSS("position", "relative");
  const height = () => host.evaluate((element) => element.getBoundingClientRect().height);
  await expect.poll(height).toBeGreaterThan(300);
  await expect.poll(async () => Math.abs((await height()) - (await region.boundingBox())!.height)).toBeLessThan(3);
  await page.getByRole("complementary", { name: "Oldalsáv" }).hover();
  await expect.poll(height).toBeGreaterThan(300);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(height).toBeGreaterThan(300);
  await expect.poll(async () => Math.abs((await height()) - (await region.boundingBox())!.height)).toBeLessThan(3);
});
