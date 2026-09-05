const { CosmosClient } = require("@azure/cosmos")

// The Container reference itself is a cheap, stateless client-side object —
// no network call happens until an operation runs on it — so caching it is
// just avoiding rebuilding the CosmosClient on every invocation.
let container = null

function getContainer() {
  if (!container) {
    const client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    })
    container = client
      .database(process.env.COSMOS_DATABASE || "skillquest")
      .container(process.env.COSMOS_CONTAINER || "sessions")
  }
  return container
}

module.exports = { getContainer }
