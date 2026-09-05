export function mean(values) {
  if (!values || values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function variance(values) {
  if (!values || values.length < 2) return 0
  const m = mean(values)
  return mean(values.map((v) => (v - m) ** 2))
}

export function stdDev(values) {
  return Math.sqrt(variance(values))
}

/**
 * Percentile rank of `value` among `allValues` (0-100).
 * If higherIsBetter is false, the rank is inverted so that a "better"
 * (lower) value still yields a higher percentile.
 */
export function percentileRank(value, allValues, higherIsBetter = true) {
  if (!allValues || allValues.length === 0) return 50
  const n = allValues.length
  const below = allValues.filter((v) => v < value).length
  const equal = allValues.filter((v) => v === value).length
  let rank = ((below + 0.5 * equal) / n) * 100
  if (!higherIsBetter) rank = 100 - rank
  return Math.round(Math.max(0, Math.min(100, rank)))
}

export function round(value, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
