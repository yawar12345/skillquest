// Rule-based (not AI-generated) plain-English summaries of where a candidate
// sits relative to the comparison pool. Kept strictly descriptive — no
// "good/bad" framing — to match the app's no-pass/fail philosophy.

export function buildHighlights(traits) {
  return traits
    .filter((t) => t.percentile != null)
    .map((t) => {
      const noun = t.subtitle.toLowerCase()
      if (t.percentile >= 75) {
        return `Higher ${noun} than most other candidates.`
      }
      if (t.percentile <= 25) {
        return `Lower ${noun} than most other candidates.`
      }
      return `In line with the group average for ${noun}.`
    })
}

/** One-paragraph plain-English readout for the top of the results page. */
export function buildSummary(candidateName, position, traits, hasComparison) {
  const roleText = position ? `other applicants for ${position}` : "other candidates"

  if (!hasComparison) {
    return `${candidateName} is the first${position ? ` ${position} ` : " "}candidate to complete SkillQuest — once more candidates finish, this summary will compare their approach against the group.`
  }

  const strengths = traits
    .filter((t) => t.percentile != null && t.percentile >= 75)
    .map((t) => t.subtitle.toLowerCase())
  const weaknesses = traits
    .filter((t) => t.percentile != null && t.percentile <= 25)
    .map((t) => t.subtitle.toLowerCase())

  const clauses = []
  if (strengths.length) clauses.push(`stood out for ${joinList(strengths)}`)
  if (weaknesses.length) clauses.push(`scored lower on ${joinList(weaknesses)}`)

  if (!clauses.length) {
    return `${candidateName}'s results were in line with the group average across every measured trait, compared to ${roleText}.`
  }
  return `${candidateName} ${clauses.join(", and ")}, compared to ${roleText}.`
}

function joinList(items) {
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}
