import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import AdminHeader from "@/components/layout/AdminHeader"
import GameScoreCard from "@/components/admin/GameScoreCard"
import RadarComparisonChart from "@/components/admin/RadarComparisonChart"
import TraitComparisonBars from "@/components/admin/TraitComparisonBars"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSession, getComparisonPool } from "@/lib/storage"
import { GAME_ORDER, GAME_DEFS } from "@/lib/gameConfig"
import { mean, percentileRank, round } from "@/lib/metrics"
import { buildHighlights, buildSummary } from "@/lib/insights"
import { formatDuration } from "@/lib/time"
import {
  ArrowLeft,
  Clock,
  FileText,
  Lightbulb,
  ShieldAlert,
  Users,
} from "lucide-react"

export default function AdminCandidateDetailPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(undefined)
  const [pool, setPool] = useState([])
  const [compareId, setCompareId] = useState("none")
  const [scopeAll, setScopeAll] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const [s, p] = await Promise.all([
        getSession(sessionId),
        getComparisonPool(sessionId),
      ])
      if (!active) return
      setSession(s)
      setPool(p)
    }
    load()
    return () => {
      active = false
    }
  }, [sessionId])

  // By default, only compare against candidates who applied for the same
  // role — a "good" score profile for Sales isn't the same as for
  // Engineering. Falls back to the full pool if there's no position on this
  // session, or no other candidates share it yet.
  const positionPool = session?.position
    ? pool.filter((s) => s.position === session.position)
    : pool
  const scopedByPosition = Boolean(session?.position) && positionPool.length > 0
  const effectivePool = scopeAll || !scopedByPosition ? pool : positionPool

  useEffect(() => {
    setCompareId("none")
  }, [scopeAll])

  const selectedSession =
    compareId !== "none"
      ? effectivePool.find((s) => s.id === compareId) ?? null
      : null

  const hasComparison = effectivePool.length > 0

  // Percentile rank of each metric vs. the comparison pool, for the score cards.
  const percentilesByGame = useMemo(() => {
    if (!session) return {}
    const result = {}
    for (const gameKey of GAME_ORDER) {
      const def = GAME_DEFS[gameKey]
      const values = session.games[gameKey]
      if (!values) continue
      result[gameKey] = {}
      for (const metric of def.metrics) {
        const poolValues = effectivePool
          .map((s) => s.games[gameKey]?.[metric.key])
          .filter((v) => typeof v === "number")
        result[gameKey][metric.key] = percentileRank(
          values[metric.key],
          poolValues,
          metric.higherIsBetter
        )
      }
    }
    return result
  }, [session, effectivePool])

  // One entry per game/trait: candidate + group average + (optional) selected
  // candidate, all normalized onto the same 0-100 scale so every series is
  // comparable regardless of the metric's original unit.
  const traits = useMemo(() => {
    if (!session) return []
    return GAME_ORDER.map((gameKey) => {
      const def = GAME_DEFS[gameKey]
      const primary = def.metrics.find((m) => m.isRadarPrimary)
      const candidateValue = session.games[gameKey]?.[primary.key]
      const poolValues = effectivePool
        .map((s) => s.games[gameKey]?.[primary.key])
        .filter((v) => typeof v === "number")
      const selectedValue = selectedSession?.games[gameKey]?.[primary.key]

      const allValues = [
        ...(typeof candidateValue === "number" ? [candidateValue] : []),
        ...poolValues,
        ...(typeof selectedValue === "number" ? [selectedValue] : []),
      ]
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      const normalize = (v) => {
        if (v === undefined || v === null || Number.isNaN(v)) return null
        if (max === min) return 50
        const ratio = (v - min) / (max - min)
        return Math.round((primary.higherIsBetter ? ratio : 1 - ratio) * 100)
      }

      return {
        key: gameKey,
        label: def.radarLabel,
        subtitle: def.subtitle,
        metricLabel: primary.label,
        format: primary.format,
        percentile: percentilesByGame[gameKey]?.[primary.key] ?? null,
        candidateRaw: candidateValue,
        candidateNormalized: normalize(candidateValue),
        averageRaw: poolValues.length ? round(mean(poolValues), 1) : null,
        averageNormalized: poolValues.length ? normalize(mean(poolValues)) : null,
        selectedRaw: selectedValue ?? null,
        selectedNormalized: normalize(selectedValue),
      }
    })
  }, [session, effectivePool, selectedSession, percentilesByGame])

  const radarData = traits.map((t) => ({
    subject: t.label,
    candidate: t.candidateNormalized ?? 0,
    average: t.averageNormalized,
    selected: t.selectedNormalized,
  }))

  const highlights = hasComparison ? buildHighlights(traits) : []
  const summary = session
    ? buildSummary(session.candidateName, session.position, traits, hasComparison)
    : ""

  if (session === undefined) {
    return (
      <PageShell>
        <p className="p-10 text-center text-muted-foreground">Loading…</p>
      </PageShell>
    )
  }

  if (session === null) {
    return (
      <PageShell>
        <p className="p-10 text-center text-muted-foreground">
          We couldn&apos;t find that candidate session.
        </p>
      </PageShell>
    )
  }

  const allGamesComplete = GAME_ORDER.every((k) => session.games[k])
  const durationLabel =
    session.startedAt && session.completedAt
      ? formatDuration(
          new Date(session.completedAt) - new Date(session.startedAt)
        )
      : null

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to candidates
        </Link>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              {session.candidateName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {session.candidateEmail} · Completed{" "}
              {new Date(session.completedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {session.position ? ` · Applied for ${session.position}` : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {durationLabel ? <StatPill icon={Clock} label={`Took ${durationLabel}`} /> : null}
            <StatPill
              icon={Users}
              label={
                hasComparison
                  ? `Compared against ${effectivePool.length} other candidate${effectivePool.length === 1 ? "" : "s"}`
                  : "First completed candidate"
              }
            />
          </div>
        </div>

        <Card className="mb-6 border-border/80 bg-muted/30">
          <CardContent className="flex items-start gap-3 pt-6">
            <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground/90">{summary}</p>
          </CardContent>
        </Card>

        <Alert className="mb-8 border-accent bg-accent/40">
          <ShieldAlert className="size-4" />
          <AlertDescription className="text-foreground/80">
            These are behavioral indicators, not pass/fail judgments. Use
            alongside interviews and job-relevant criteria.
          </AlertDescription>
        </Alert>

        {!allGamesComplete ? (
          <Alert className="mb-8">
            <AlertDescription>
              This candidate&apos;s session is marked complete, but one or
              more game results are missing.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="mb-8 border-border/80">
          <CardContent className="flex flex-col gap-6 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="mb-1 font-display text-xl font-semibold text-foreground">
                  Comparison
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hasComparison
                    ? "Every trait is normalized across the comparison group, so values are directly comparable."
                    : "This is the first completed session in this group — there's no average to compare against yet."}
                </p>
                {session.position ? (
                  scopedByPosition ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Scoped to {positionPool.length} other{" "}
                      {session.position} applicant
                      {positionPool.length === 1 ? "" : "s"}.{" "}
                      {pool.length > positionPool.length ? (
                        <button
                          type="button"
                          onClick={() => setScopeAll((v) => !v)}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {scopeAll
                            ? `Show ${session.position} applicants only`
                            : `Compare against all ${pool.length} candidates instead`}
                        </button>
                      ) : null}
                    </p>
                  ) : pool.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      No other {session.position} applicants yet — showing
                      all {pool.length} candidates instead.
                    </p>
                  ) : null
                ) : null}
              </div>
              {effectivePool.length > 0 ? (
                <div className="flex flex-col gap-1.5 sm:items-end">
                  <span className="text-xs font-medium text-muted-foreground">
                    Compare against a specific candidate
                  </span>
                  <Select value={compareId} onValueChange={setCompareId}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="None selected">
                        {(value) =>
                          value && value !== "none"
                            ? effectivePool.find((s) => s.id === value)?.candidateName ?? value
                            : "None (group average only)"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (group average only)</SelectItem>
                      {effectivePool.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.candidateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>

            {hasComparison ? (
              <>
                <TraitComparisonBars
                  traits={traits}
                  hasComparison={hasComparison}
                  selectedName={selectedSession?.candidateName}
                />
                <div className="border-t border-border pt-6">
                  <RadarComparisonChart
                    data={radarData}
                    selectedName={selectedSession?.candidateName}
                  />
                </div>
                {highlights.length > 0 ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Lightbulb className="size-4 text-primary" />
                      Highlights vs. the group average
                    </div>
                    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                Once more candidates complete SkillQuest, this section will
                compare this candidate against the group.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {GAME_ORDER.map((gameKey) => {
            const metrics = session.games[gameKey]
            if (!metrics) return null
            return (
              <GameScoreCard
                key={gameKey}
                gameDef={GAME_DEFS[gameKey]}
                metrics={metrics}
                percentiles={percentilesByGame[gameKey]}
                hasComparison={hasComparison}
                selectedMetrics={selectedSession?.games[gameKey]}
                selectedName={selectedSession?.candidateName}
              />
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}

function StatPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}

function PageShell({ children }) {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-background">
      <AdminHeader />
      {children}
    </div>
  )
}
