import { GAME_ORDER, GAME_DEFS } from "@/lib/gameConfig"

export function sessionsToCsv(sessions) {
  const columns = [
    "id",
    "candidateName",
    "candidateEmail",
    "position",
    "status",
    "createdAt",
    "completedAt",
  ]
  const metricColumns = []
  for (const gameKey of GAME_ORDER) {
    for (const metric of GAME_DEFS[gameKey].metrics) {
      metricColumns.push(`${gameKey}.${metric.key}`)
    }
  }
  const header = [...columns, "timeToCompleteSeconds", ...metricColumns]

  const rows = sessions.map((session) => {
    const base = columns.map((c) => escapeCsv(session[c]))
    const timeToCompleteSeconds =
      session.startedAt && session.completedAt
        ? Math.round(
            (new Date(session.completedAt) - new Date(session.startedAt)) / 1000
          )
        : ""
    const metrics = metricColumns.map((path) => {
      const [gameKey, metricKey] = path.split(".")
      const value = session.games?.[gameKey]?.[metricKey]
      return escapeCsv(value ?? "")
    })
    return [...base, escapeCsv(timeToCompleteSeconds), ...metrics].join(",")
  })

  return [header.join(","), ...rows].join("\n")
}

function escapeCsv(value) {
  const str = String(value ?? "")
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
