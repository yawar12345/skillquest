import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import {
  loginAsAdmin,
  generateCandidateLink,
  completeAssessment,
} from "./helpers.js"
import { deleteTestSessions } from "./cosmos-cleanup.js"

// Both tests below share a database and clean up by a common "Test "
// candidate-name prefix, so they can't safely run in parallel against each
// other (one test's cleanup could delete the other's in-flight fixture).
test.describe.configure({ mode: "serial" })

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
  test.setTimeout(480_000)

  // Data now lives in a real database, not per-context localStorage — clear
  // out any "Test "-prefixed fixtures left behind by a previous failed run
  // so this run starts from a known-clean slate.
  await deleteTestSessions()

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
  await expect(page.getByRole("table").getByText("Test Alpha").first()).toBeVisible()
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

// This is the test that actually matters for the localStorage -> API
// migration: admin and candidate now run in fully independent browser
// contexts — no shared cookies, no shared localStorage, nothing — a stand-in
// for genuinely different devices. Before this migration, this scenario was
// impossible to pass: the candidate's data lived only in their own
// browser's localStorage, invisible to any other context.
test("candidate and admin see the same data from separate devices", async ({
  browser,
}) => {
  test.setTimeout(180_000)
  await deleteTestSessions()

  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await loginAsAdmin(adminPage)
  const url = await generateCandidateLink(adminPage)

  const candidateContext = await browser.newContext()
  const candidatePage = await candidateContext.newPage()
  await completeAssessment(candidatePage, url, {
    name: "Test CrossDevice",
    email: "crossdevice@example.test",
    position: "Marketing",
  })
  await candidateContext.close()

  await adminPage.goto("/admin")
  await expect(
    adminPage.getByRole("table").getByText("Test CrossDevice").first()
  ).toBeVisible()
  await adminPage.getByRole("link", { name: "View results" }).first().click()
  await expect(
    adminPage.getByRole("heading", { name: "Test CrossDevice" })
  ).toBeVisible()

  await adminContext.close()
})
