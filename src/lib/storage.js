// Data layer for SkillQuest.
//
// Every function here returns a Promise, even though the current
// implementation is a synchronous localStorage read/write. That keeps the
// call sites (components, hooks) identical to what they'd look like against
// a real HTTP API — swapping the body of these functions for `fetch` calls
// later shouldn't require touching anything outside this file.

import { SAMPLE_CANDIDATES } from "@/lib/sampleData"

const SESSIONS_KEY = "skillquest.sessions.v1"
const ADMIN_AUTH_KEY = "skillquest.admin_authed.v1"

export const GAME_KEYS = ["balloon", "memory", "cardSort", "reaction"]

function readSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 8)
  }
  return Math.random().toString(36).slice(2, 10)
}

function emptyGames() {
  return { balloon: null, memory: null, cardSort: null, reaction: null }
}

function nowIso() {
  return new Date().toISOString()
}

/** Create a new candidate session (admin "Generate link" action). */
export async function createSession() {
  const sessions = readSessions()
  const session = {
    id: generateId(),
    createdAt: nowIso(),
    status: "pending", // pending -> in_progress -> completed
    candidateName: null,
    candidateEmail: null,
    position: null,
    startedAt: null,
    completedAt: null,
    currentGameIndex: 0,
    games: emptyGames(),
  }
  sessions.push(session)
  writeSessions(sessions)
  return session
}

export async function getSession(id) {
  return readSessions().find((s) => s.id === id) ?? null
}

export async function listSessions() {
  return readSessions().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
}

async function updateSession(id, patch) {
  const sessions = readSessions()
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx === -1) return null
  sessions[idx] = { ...sessions[idx], ...patch }
  writeSessions(sessions)
  return sessions[idx]
}

/** Candidate submits name/email/position on the welcome screen. */
export async function startSession(id, { name, email, position }) {
  return updateSession(id, {
    candidateName: name,
    candidateEmail: email,
    position: position ?? null,
    status: "in_progress",
    startedAt: nowIso(),
  })
}

/** Save one game's metrics and advance the progress pointer. */
export async function saveGameResult(id, gameKey, metrics) {
  const session = await getSession(id)
  if (!session) return null
  const games = { ...session.games, [gameKey]: metrics }
  const nextIndex = Math.min(
    GAME_KEYS.indexOf(gameKey) + 1,
    GAME_KEYS.length
  )
  return updateSession(id, { games, currentGameIndex: nextIndex })
}

export async function completeSession(id) {
  return updateSession(id, { status: "completed", completedAt: nowIso() })
}

export async function setCurrentGameIndex(id, index) {
  return updateSession(id, { currentGameIndex: index })
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
  const sessions = readSessions()
  const now = Date.now()
  SAMPLE_CANDIDATES.forEach((candidate, i) => {
    const completedAt = new Date(now - (SAMPLE_CANDIDATES.length - i) * 3600_000)
    const startedAt = new Date(completedAt.getTime() - candidate.durationMinutes * 60_000)
    sessions.push({
      id: generateId(),
      createdAt: startedAt.toISOString(),
      status: "completed",
      candidateName: candidate.candidateName,
      candidateEmail: candidate.candidateEmail,
      position: candidate.position,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      currentGameIndex: GAME_KEYS.length,
      games: candidate.games,
    })
  })
  writeSessions(sessions)
  return sessions
}

// --- Admin auth (v1: hardcoded passcode via env var) ---

export function isAdminAuthed() {
  return localStorage.getItem(ADMIN_AUTH_KEY) === "true"
}

export async function adminLogin(passcode) {
  const expected = import.meta.env.VITE_ADMIN_PASSCODE || "skillquest-admin"
  const ok = passcode === expected
  if (ok) localStorage.setItem(ADMIN_AUTH_KEY, "true")
  return ok
}

export async function adminLogout() {
  localStorage.removeItem(ADMIN_AUTH_KEY)
}
