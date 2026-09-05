const { app } = require("@azure/functions")
const { createAdminToken, checkPasscode } = require("../lib/auth")

app.http("adminLogin", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/login",
  handler: async (request) => {
    const body = await request.json().catch(() => ({}))
    if (!checkPasscode(body.passcode)) {
      return { status: 401, jsonBody: { ok: false } }
    }
    return { jsonBody: { ok: true, token: createAdminToken() } }
  },
})
