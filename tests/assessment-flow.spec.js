import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import {
  loginAsAdmin,
  generateCandidateLink,
  completeAssessment,
} from "./helpers.js"

// This is the quality gate: it drives two full candidate sessions through
// every game and checks that results reach the admin dashboard, the
// position-scoped comparison unlocks once a peer exists, and CSV export
// still produces the expected columns. Real timers in each game mean this
// takes a while — that's the trade-off for testing actual gameplay instead
// of just asserting on mocked data.
test("full candidate journey: assessment, results, and admin comparison", async ({
  page,
  context,
}) => {
  test.setTimeout(240_000)

  await loginAsAdmin(page)

  // --- Candidate A: first completed session, no peer to compare against yet ---
  const urlA = await generateCandidateLink(page)
  const candidateA = await context.newPage()
  await completeAssessment(candidateA, urlA, {
    name: "Test Alpha",
    email: "alpha@example.test",
    position: "Sales Representative",
  })
  await expect(candidateA.getByText("Your approach, at a glance")).toBeVisible()
  await candidateA.close()

  await page.goto("/admin")
  // The dashboard renders both a mobile card list and a desktop table (one
  // hidden via CSS depending on viewport), so scope to the table to avoid
  // matching the same candidate name twice.
  await expect(page.getByRole("table").getByText("Test Alpha")).toBeVisible()
  await page.getByRole("link", { name: "View results" }).first().click()
  await expect(page.getByRole("heading", { name: "Test Alpha" })).toBeVisible()
  await expect(page.getByText("First completed candidate")).toBeVisible()

  // --- Candidate B: same position, should unlock peer comparison for both ---
  const urlB = await generateCandidateLink(page)
  const candidateB = await context.newPage()
  await completeAssessment(candidateB, urlB, {
    name: "Test Beta",
    email: "beta@example.test",
    position: "Sales Representative",
  })
  await candidateB.close()

  await page.goto("/admin")
  await page.getByRole("link", { name: "View results" }).first().click()
  await expect(
    page.getByText(/Scoped to 1 other Sales Representative applicant/)
  ).toBeVisible()
  await expect(page.getByText("Highlights vs. the group average")).toBeVisible()

  // --- CSV export includes both candidates with the expected columns ---
  await page.goto("/admin")
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export CSV" }).click(),
  ])
  const csvPath = test.info().outputPath("export.csv")
  await download.saveAs(csvPath)
  const csv = readFileSync(csvPath, "utf-8")
  const header = csv.split("\n")[0]
  expect(header).toContain("position")
  expect(header).toContain("timeToCompleteSeconds")
  expect(csv).toContain("Test Alpha")
  expect(csv).toContain("Test Beta")
})
