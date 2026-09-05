const crypto = require("node:crypto")

// Stateless bearer token: base64url(payload + "." + HMAC(payload)). No
// session store needed — verification is just recomputing the signature —
// which fits a single-admin-passcode app better than provisioning a real
// auth service.
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

function sign(payload) {
  return crypto.createHmac("sha256", requireSecret()).update(payload).digest("hex")
}

function requireSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!secret) throw new Error("ADMIN_TOKEN_SECRET is not configured")
  return secret
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function createAdminToken() {
  const expires = Date.now() + TOKEN_TTL_MS
  const payload = `admin.${expires}`
  return Buffer.from(`${payload}.${sign(payload)}`).toString("base64url")
}

function verifyAdminToken(token) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8")
    const parts = decoded.split(".")
    if (parts.length !== 3) return false
    const [role, expiresStr, sig] = parts
    if (role !== "admin") return false
    if (Number(expiresStr) < Date.now()) return false
    return safeEqual(sig, sign(`${role}.${expiresStr}`))
  } catch {
    return false
  }
}

// Azure Static Web Apps' proxy for a linked (managed) Functions API
// overwrites the standard `Authorization` header with its own internal
// platform token before the request reaches this code — any custom bearer
// token sent there is silently discarded. A custom header name isn't
// reserved, so it survives the proxy untouched.
function isAdminRequest(request) {
  const token = request.headers.get("x-admin-token")
  return Boolean(token && verifyAdminToken(token))
}

function checkPasscode(passcode) {
  const expected = process.env.ADMIN_PASSCODE || "skillquest-admin"
  return safeEqual(String(passcode || ""), expected)
}

module.exports = { createAdminToken, isAdminRequest, checkPasscode }
