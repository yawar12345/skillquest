const { app } = require("@azure/functions")
const { getContainer } = require("../lib/cosmos")

const GAME_ORDER = ["balloon", "memory", "cardSort", "reaction"]

async function readSession(container, id) {
  try {
    const { resource } = await container.item(id, id).read()
    return resource || null
  } catch (err) {
    if (err.code === 404) return null
    throw err
  }
}

app.http("startSession", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "sessions/{id}/start",
  handler: async (request) => {
    const id = request.params.id
    const body = await request.json().catch(() => ({}))
    const container = getContainer()
    const session = await readSession(container, id)
    if (!session) return { status: 404, jsonBody: null }

    const updated = {
      ...session,
      candidateName: body.name ?? null,
      candidateEmail: body.email ?? null,
      position: body.position ?? null,
      status: "in_progress",
      startedAt: new Date().toISOString(),
    }
    const { resource } = await container.item(id, id).replace(updated)
    return { jsonBody: resource }
  },
})

app.http("saveGameResult", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "sessions/{id}/games/{gameKey}",
  handler: async (request) => {
    const id = request.params.id
    const gameKey = request.params.gameKey
    const metrics = await request.json().catch(() => ({}))
    const container = getContainer()
    const session = await readSession(container, id)
    if (!session) return { status: 404, jsonBody: null }

    const games = { ...session.games, [gameKey]: metrics }
    const nextIndex = Math.min(GAME_ORDER.indexOf(gameKey) + 1, GAME_ORDER.length)
    const updated = { ...session, games, currentGameIndex: nextIndex }
    const { resource } = await container.item(id, id).replace(updated)
    return { jsonBody: resource }
  },
})

app.http("completeSession", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "sessions/{id}/complete",
  handler: async (request) => {
    const id = request.params.id
    const container = getContainer()
    const session = await readSession(container, id)
    if (!session) return { status: 404, jsonBody: null }

    const updated = { ...session, status: "completed", completedAt: new Date().toISOString() }
    const { resource } = await container.item(id, id).replace(updated)
    return { jsonBody: resource }
  },
})
