import { defineConfig, devices } from "@playwright/test";

const databaseUrl = process.env.AUTH_TEST_DATABASE_URL;
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("_test")) {
  throw new Error("Set AUTH_TEST_DATABASE_URL to a dedicated database ending in _test");
}
const commonEnv = {
  DATABASE_URL: databaseUrl,
  BETTER_AUTH_SECRET: "e2e-secret-only-for-isolated-auth-tests-12345",
  BETTER_AUTH_URL: "http://localhost:3100",
  WEB_ORIGIN: "http://localhost:3100",
  HOST: "127.0.0.1",
  PORT: "3101",
  MAIL_PROVIDER: "smtp",
  SMTP_HOST: "127.0.0.1",
  SMTP_PORT: process.env.SMTP_PORT ?? "1025",
  MAIL_FROM: "Csavargó <noreply@csavargo.local>",
};
export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 1, retries: 0,
  timeout: 60000,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    { command: "pnpm --dir csavargo-api db:deploy && pnpm --dir csavargo-api build && pnpm --dir csavargo-api start",
      url: "http://127.0.0.1:3101/health", env: { ...commonEnv, NODE_ENV: "test" }, timeout: 120000, reuseExistingServer: false },
    { command: "pnpm --dir csavargo-web build && pnpm --dir csavargo-web start --port 3100",
      url: "http://localhost:3100", env: { API_INTERNAL_URL: "http://127.0.0.1:3101" }, timeout: 180000, reuseExistingServer: false },
  ],
});
