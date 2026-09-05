import { test, expect } from "@playwright/test"
import { ADMIN_PASSCODE } from "./helpers.js"

test.describe("Admin authentication", () => {
  test("rejects an incorrect passcode", async ({ page }) => {
    await page.goto("/admin/login")
    await page.getByLabel("Passcode").fill("definitely-wrong")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText("That passcode isn't right. Try again.")).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("accepts the correct passcode and reaches the dashboard", async ({ page }) => {
    await page.goto("/admin/login")
    await page.getByLabel("Passcode").fill(ADMIN_PASSCODE)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByRole("heading", { name: "Candidates" })).toBeVisible()
  })

  test("redirects unauthenticated visitors away from the dashboard", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})

test.describe("Invalid candidate links", () => {
  test("shows a friendly message for a made-up session id", async ({ page }) => {
    await page.goto("/assessment/does-not-exist")
    await expect(page.getByText(/isn.t valid/i)).toBeVisible()
  })
})
