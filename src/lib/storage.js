// Data layer for SkillQuest.
//
// Backed by the Azure Functions API under /api — every function here
// already returned a Promise even back when this was a localStorage-only
// prototype, specifically so this swap wouldn't require touching anything
// outside this file.

const ADMIN_TOKEN_KEY = "skillquest.admin_token.v1"

async function apiFetch(path, { auth = false, ...options } = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers }
  if (auth) {
    // Not a standard Authorization header — Azure Static Web Apps' proxy
    // for a linked Functions API overwrites that one with its own internal
    // platform token, silently discarding whatever the client sent.
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (token) headers["X-Admin-Token"] = token
  }
  const res = await fetch(`/api${path}`, { ...options, headers })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with ${res.status}`)
  }
  return res.json()
}

/** Create a new candidate session (admin "Generate link" action). */
export async function createSession() {
  return apiFetch("/sessions", { method: "POST" })
}

export async function getSession(id) {
  return apiFetch(`/sessions/${id}`)
}

export async function listSessions() {
  return apiFetch("/sessions", { auth: true })
}

/** Candidate submits name/email/position on the welcome screen. */
export async function startSession(id, { name, email, position }) {
  return apiFetch(`/sessions/${id}/start`, {
    method: "POST",
    body: JSON.stringify({ name, email, position }),
  })
}

/** Save one game's metrics and advance the progress pointer. */
export async function saveGameResult(id, gameKey, metrics) {
  return apiFetch(`/sessions/${id}/games/${gameKey}`, {
    method: "POST",
    body: JSON.stringify(metrics),
  })
}

export async function completeSession(id) {
  return apiFetch(`/sessions/${id}/complete`, { method: "POST" })
}

export async function getCompletedSessions() {
  return (await listSessions()).filter((s) => s.status === "completed")
}

/** All completed sessions except `excludeId`, for percentile/aggregate comparisons. */
export async function getComparisonPool(excludeId) {
  return (await getCompletedSessions()).filter((s) => s.id !== excludeId)
}

/** Append the built-in demo candidates (varied performance, two positions). */
export async function seedSampleSessions() {
  return apiFetch("/seed", { method: "POST", auth: true })
}

// --- Admin auth ---
// The passcode is checked server-side now — it never ships in the JS
// bundle — and a signed, expiring bearer token is what's actually kept in
// this browser's localStorage. That's an appropriate use of localStorage
// (a credential for *this device's* admin session), unlike candidate data,
// which now lives in the shared database instead.

export function isAdminAuthed() {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY))
}

export async function adminLogin(passcode) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passcode }),
  })
  if (!res.ok) return false
  const { token } = await res.json()
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
  return true
}

export async function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}
