import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { mean, stdDev, round } from "@/lib/metrics"
import { cn } from "@/lib/utils"

const TOTAL_TRIALS = 20
const DECOY_COUNT = 5
const MIN_DELAY_MS = 700
const MAX_DELAY_MS = 2200
const RESPONSE_WINDOW_MS = 1800
const RESULT_PAUSE_MS = 350

function buildTrialTypes() {
  const arr = Array.from({ length: TOTAL_TRIALS }, (_, i) =>
    i < DECOY_COUNT ? "decoy" : "target"
  )
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function ReactionGame({ onComplete }) {
  const [trialTypes] = useState(buildTrialTypes)
  const [trialIndex, setTrialIndex] = useState(0)
  const [phase, setPhase] = useState("waiting") // waiting | active | result
  const [position, setPosition] = useState({ top: 50, left: 50 })
  const [resultKind, setResultKind] = useState(null)

  const shownAtRef = useRef(0)
  const resolvedRef = useRef(false)
  const responseTimeoutRef = useRef(null)
  const reactionTimesRef = useRef([])
  const falseClicksRef = useRef(0)
  const decoysShownRef = useRef(0)
  const completedRef = useRef(false)

  const trialType = trialTypes[trialIndex]

  useEffect(() => {
    if (trialIndex >= TOTAL_TRIALS) return
    resolvedRef.current = false
    setPhase("waiting")
    setResultKind(null)

    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    const showTimer = setTimeout(() => {
      setPosition({
        top: 15 + Math.random() * 55,
        left: 10 + Math.random() * 70,
      })
      shownAtRef.current = Date.now()
      setPhase("active")
      if (trialTypes[trialIndex] === "decoy") {
        decoysShownRef.current += 1
      }
      responseTimeoutRef.current = setTimeout(() => {
        resolveTrial(trialTypes[trialIndex] === "decoy" ? "restraint" : "miss")
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, RESPONSE_WINDOW_MS)
    }, delay)

    return () => {
      clearTimeout(showTimer)
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex])

  useEffect(() => {
    if (trialIndex < TOTAL_TRIALS) return
    if (completedRef.current) return
    completedRef.current = true
    const rts = reactionTimesRef.current
    onComplete({
      avgReactionTimeMs: rts.length ? round(mean(rts), 0) : 0,
      reactionTimeStdDevMs: rts.length ? round(stdDev(rts), 0) : 0,
      falseClickRate: decoysShownRef.current
        ? round(falseClicksRef.current / decoysShownRef.current, 3)
        : 0,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trialIndex])

  function resolveTrial(kind) {
    if (resolvedRef.current) return
    resolvedRef.current = true
    if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current)

    if (kind === "hit") {
      reactionTimesRef.current.push(Date.now() - shownAtRef.current)
    } else if (kind === "falseClick") {
      falseClicksRef.current += 1
    }
    setResultKind(kind)
    setPhase("result")
    setTimeout(() => setTrialIndex((i) => i + 1), RESULT_PAUSE_MS)
  }

  function handleShapeClick() {
    if (phase !== "active") return
    resolveTrial(trialType === "target" ? "hit" : "falseClick")
  }

  const finished = trialIndex >= TOTAL_TRIALS

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Reaction Speed
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">
          Click the <span className="font-medium text-primary">blue circle</span> as
          soon as it appears. Leave the{" "}
          <span className="font-medium text-muted-foreground">gray circle</span> alone.
        </p>
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        Trial {Math.min(trialIndex + 1, TOTAL_TRIALS)} / {TOTAL_TRIALS}
      </p>

      <div className="relative h-72 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card sm:h-80">
        {!finished ? (
          <AnimatePresence>
            {phase === "active" && (
              <motion.button
                key={trialIndex}
                type="button"
                onClick={handleShapeClick}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "absolute size-14 rounded-full shadow-sm",
                  trialType === "target" ? "bg-primary" : "bg-muted-foreground"
                )}
                style={{ top: `${position.top}%`, left: `${position.left}%` }}
                aria-label={trialType === "target" ? "Target" : "Decoy"}
              />
            )}
          </AnimatePresence>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Tallying results…
          </div>
        )}

        {phase === "waiting" && !finished ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Get ready…
          </div>
        ) : null}
      </div>

      <div className="h-5 text-sm font-medium">
        {resultKind === "hit" && <span className="text-success">Nice — got it.</span>}
        {resultKind === "miss" && <span className="text-muted-foreground">Missed that one.</span>}
        {resultKind === "falseClick" && (
          <span className="text-destructive">That was the decoy.</span>
        )}
        {resultKind === "restraint" && <span className="text-success">Good restraint.</span>}
      </div>
    </div>
  )
}
