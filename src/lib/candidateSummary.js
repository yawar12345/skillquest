import { GAME_ORDER, GAME_DEFS } from "@/lib/gameConfig"

// Fixed, absolute plausible bounds for each game's headline metric — NOT
// derived from other candidates. This is what lets a candidate see their own
// results without any peer comparison: the bar position comes purely from
// where their raw value falls in a realistic range for that game.
const TRAIT_RANGES = {
  balloon: { min: 0, max: 25, higherIsBetter: true }, // avg. pumps on unpopped balloons
  memory: { min: 3, max: 10, higherIsBetter: true }, // max sequence length reached
  cardSort: { min: 0, max: 24, higherIsBetter: true }, // correct sorts out of 24
  reaction: { min: 250, max: 700, higherIsBetter: false }, // avg. reaction time (lower = faster)
}

/** Candidate-facing trait summary: own level only, no peer comparison. */
export function buildCandidateTraits(session) {
  return GAME_ORDER.map((gameKey) => {
    const def = GAME_DEFS[gameKey]
    const primary = def.metrics.find((m) => m.isRadarPrimary)
    const value = session.games[gameKey]?.[primary.key]
    const range = TRAIT_RANGES[gameKey]
    if (typeof value !== "number" || !range) return null

    const ratio = Math.max(0, Math.min(1, (value - range.min) / (range.max - range.min)))
    const percent = Math.round((range.higherIsBetter ? ratio : 1 - ratio) * 100)
    const level = percent >= 66 ? "higher" : percent <= 33 ? "lower" : "typical"

    return {
      key: gameKey,
      label: def.radarLabel,
      description: describeLevel(def.subtitle, level),
      percent,
    }
  }).filter(Boolean)
}

function describeLevel(subtitle, level) {
  const noun = subtitle.toLowerCase()
  if (level === "higher") return `Higher ${noun} than typical.`
  if (level === "lower") return `Lower ${noun} than typical.`
  return `Typical ${noun}.`
}
