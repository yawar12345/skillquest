// Shared helpers for driving the candidate assessment flow in tests.
// The app has no real backend — a candidate's session lives only in the
// browser's localStorage — so admin and candidate pages must come from the
// same BrowserContext (via `context.newPage()`) to see the same data.

export const ADMIN_PASSCODE = "skillquest-admin"

export async function loginAsAdmin(page) {
  await page.goto("/admin/login")
  await page.getByLabel("Passcode").fill(ADMIN_PASSCODE)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForSelector("text=Candidates")
}

/** Generates a candidate link from the (already logged in) admin dashboard. */
export async function generateCandidateLink(adminPage) {
  await adminPage.goto("/admin")
  await adminPage.waitForSelector("text=Candidates")
  // The empty-state dashboard renders its own "Generate link" button in
  // addition to the one in the header, so there can legitimately be two.
  await adminPage.getByRole("button", { name: "Generate link" }).first().click()
  await adminPage.waitForFunction(
    () => document.querySelector('input[readonly]')?.value.startsWith("http"),
    undefined,
    { timeout: 5000 }
  )
  const url = await adminPage.inputValue("input[readonly]")
  await adminPage.getByRole("button", { name: "Done" }).click()
  return url
}

async function waitForGameTitle(page, title, timeout = 20000) {
  await page.waitForSelector(`h2:has-text("${title}")`, { timeout })
}

async function startGameIfIntro(page, label) {
  const btn = page.getByRole("button", { name: `Start ${label}` })
  if (await btn.count() > 0) await btn.click()
}

export async function fillWelcomeForm(page, url, { name, email, position }) {
  await page.goto(url)
  await page.waitForSelector("text=Let's see how you think")
  await page.locator("#candidate-name").fill(name)
  await page.locator("#candidate-email").fill(email)
  await page.locator("#candidate-position").click()
  if (position) {
    await page.locator(`[data-slot="select-item"]:has-text("${position}")`).click()
  } else {
    await page.locator('[data-slot="select-item"]').first().click()
  }
  await page.getByRole("button", { name: "Start assessment" }).click()
}

/** Plays Balloon Risk to completion: pump once then cash out, 20 balloons. */
export async function playBalloonGame(page) {
  await waitForGameTitle(page, "Balloon Risk")
  await startGameIfIntro(page, "Balloon Risk")
  for (let b = 1; b <= 20; b++) {
    await page.waitForFunction(
      (n) => {
        const els = [...document.querySelectorAll("p")]
        const c = els.find((el) => /\/\s*20/.test(el.textContent))
        return c && c.textContent.trim().startsWith(String(n))
      },
      b,
      { timeout: 8000 }
    )
    await page.getByRole("button", { name: "Pump" }).click().catch(() => {})
    await page.waitForTimeout(50)
    const cashBtn = page.getByRole("button", { name: "Cash out" })
    if (!(await cashBtn.isDisabled().catch(() => true))) await cashBtn.click()
    await page.waitForTimeout(450)
  }
}

/**
 * Plays Memory Grid to a quick finish (two misses ends the game early).
 * Clicking cell 1 is wrong for virtually every sequence, but only counts as
 * a miss once the "showing" phase has actually finished — clicking too
 * early is silently ignored by the game, not registered as a failure. Waits
 * for the "Your turn" input-phase indicator before each click rather than
 * assuming fixed timing, and caps at a few extra attempts to absorb the
 * rare case where cell 1 happens to be correct for a given position.
 */
export async function playMemoryGame(page) {
  await waitForGameTitle(page, "Memory Grid", 10000)
  await startGameIfIntro(page, "Memory Grid")

  for (let attempt = 0; attempt < 6; attempt++) {
    if (await page.locator('h2:has-text("Card Sort")').isVisible().catch(() => false)) return
    await page.waitForSelector("text=Your turn", { timeout: 10000 }).catch(() => {})
    // The cell buttons exist (but are disabled) during the "showing" phase
    // too — a plain .click() would retry against a disabled button for its
    // full default actionability timeout (30s) instead of failing fast, so
    // give it a short budget and just try again next iteration.
    await page
      .locator('button[aria-label^="Cell"]')
      .first()
      .click({ timeout: 1500 })
      .catch(() => {})
    await page.waitForTimeout(1000)
  }
}

/**
 * Plays Card Sort to completion (24 trials, always picks pile 1). Each
 * trial locks input for a fixed feedback window after a click; a click that
 * lands during that window is silently ignored rather than counted, so this
 * polls for the transition to the next game instead of assuming a fixed
 * number of clicks always lands.
 */
export async function playCardSortGame(page) {
  await waitForGameTitle(page, "Card Sort", 15000)
  await startGameIfIntro(page, "Card Sort")

  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    if (await page.locator('h2:has-text("Reaction Speed")').isVisible().catch(() => false)) return
    // The pile buttons are disabled during each trial's feedback window; a
    // plain .click() would retry against a disabled button for its full
    // default actionability timeout (30s) instead of failing fast.
    await page.getByRole("button", { name: "Pile 1" }).click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(650)
  }
}

/**
 * Plays Reaction Speed to completion (20 trials). Each trial's shape appears
 * after a randomized delay and auto-resolves as a miss/restraint if nothing
 * is clicked in time, so total game time varies run to run — this polls for
 * a visible target and clicks it, and stops as soon as the results screen
 * shows up, rather than assuming fixed per-trial timing.
 */
export async function playReactionGame(page) {
  await waitForGameTitle(page, "Reaction Speed", 15000)
  await startGameIfIntro(page, "Reaction Speed")

  const target = page.getByRole("button", { name: "Target" })
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    if (await page.getByText("You're all done").isVisible().catch(() => false)) return
    try {
      await target.waitFor({ timeout: 800 })
      await target.click({ timeout: 500 })
    } catch {
      // a decoy is showing, or we're between trials — nothing to click yet
    }
    await page.waitForTimeout(100)
  }
}

/** Drives a full candidate session end to end, starting from the welcome form. */
export async function completeAssessment(page, url, candidate) {
  await fillWelcomeForm(page, url, candidate)
  await playBalloonGame(page)
  await playMemoryGame(page)
  await playCardSortGame(page)
  await playReactionGame(page)
  await page.waitForSelector("text=You're all done", { timeout: 15000 })
}
