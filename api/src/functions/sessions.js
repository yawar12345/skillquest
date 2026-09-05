const { app } = require("@azure/functions")
const crypto = require("node:crypto")
const { getContainer } = require("../lib/cosmos")
const { isAdminRequest } = require("../lib/auth")

function generateId() {
  return crypto.randomUUID().slice(0, 8)
}

function emptyGames() {
  return { balloon: null, memory: null, cardSort: null, reaction: null }
}

app.http("createSession", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "sessions",
  handler: async () => {
    const container = getContainer()
    const session = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: "pending",
      candidateName: null,
      candidateEmail: null,
      position: null,
      startedAt: null,
      completedAt: null,
      currentGameIndex: 0,
      games: emptyGames(),
    }
    await container.items.create(session)
    return { status: 201, jsonBody: session }
  },
})

// Listing every session is an admin-only action; fetching a single session
// by its id is not — a candidate's unguessable link id is their only
// credential, the same trust model the localStorage version had.
app.http("listSessions", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "sessions",
  handler: async (request) => {
    if (!isAdminRequest(request)) {
      return { status: 401, jsonBody: { error: "Unauthorized" } }
    }
    const container = getContainer()
    const { resources } = await container.items
      .query("SELECT * FROM c ORDER BY c.createdAt DESC")
      .fetchAll()
    return { jsonBody: resources }
  },
})

app.http("getSession", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "sessions/{id}",
  handler: async (request) => {
    const container = getContainer()
    try {
      const { resource } = await container.item(request.params.id, request.params.id).read()
      if (!resource) return { status: 404, jsonBody: null }
      return { jsonBody: resource }
    } catch (err) {
      if (err.code === 404) return { status: 404, jsonBody: null }
      throw err
    }
  },
})
