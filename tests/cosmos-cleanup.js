import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { CosmosClient } from "@azure/cosmos"

// Unlike the old localStorage version, test data now lands in a real,
// persistent database — a failed run's fixtures don't vanish with the
// browser context. This wipes anything left over from previous runs before
// a fresh test starts, so assertions like "first completed candidate" and
// "scoped to 1 other applicant" stay true regardless of prior failures.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localSettingsPath = path.resolve(__dirname, "../api/local.settings.json")

function ensureEnv() {
  if (process.env.COSMOS_ENDPOINT && process.env.COSMOS_KEY) return
  if (existsSync(localSettingsPath)) {
    const { Values } = JSON.parse(readFileSync(localSettingsPath, "utf-8"))
    for (const [key, value] of Object.entries(Values)) {
      if (!process.env[key]) process.env[key] = value
    }
  }
}

/** Deletes any session whose candidate name starts with the test fixture prefix "Test ". */
export async function deleteTestSessions() {
  ensureEnv()
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
  })
  const container = client
    .database(process.env.COSMOS_DATABASE || "skillquest")
    .container(process.env.COSMOS_CONTAINER || "sessions")

  const { resources } = await container.items
    .query("SELECT c.id FROM c WHERE STARTSWITH(c.candidateName, 'Test ')")
    .fetchAll()

  await Promise.all(
    resources.map((r) => container.item(r.id, r.id).delete().catch(() => {}))
  )
}
