import { defineConfig, devices } from "@playwright/test"

// Runs against the production build (`vite preview`) with the real Azure
// Functions API running alongside it — Vite's preview proxy forwards
// /api/* to the Functions host on 7071, mirroring the same-origin routing
// Azure Static Web Apps does in production — rather than against the dev
// server, or against a frontend with no backend behind it.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev:api",
      // Any response (even the 401 this unauthenticated GET returns) proves
      // the Functions host is up and routing — that's all this probes for.
      url: "http://localhost:7071/api/sessions",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: "pipe",
    },
    {
      command: "npm run preview -- --port 4173 --strictPort",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
