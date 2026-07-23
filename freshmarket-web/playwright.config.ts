import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Pin the locale so i18next's navigator.language detection (see src/i18n/index.ts)
    // is deterministic across machines/CI instead of picking up the host's locale.
    locale: "en-US",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // The frontend dev server is started automatically. The backend API
  // (+ PostgreSQL + Redis) must already be running separately — see
  // README's "Local Startup" section (./start.ps1) — these tests hit
  // real endpoints and are not mocked.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
