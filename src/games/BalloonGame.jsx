import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { mean, variance, round } from "@/lib/metrics"
import { Wallet } from "lucide-react"

const TOTAL_BALLOONS = 20
const CENTS_PER_PUMP = 0.05
const MAX_PUMPS = 64

function generateThresholds() {
  return Array.from(
    { length: TOTAL_BALLOONS },
    () => 1 + Math.floor(Math.random() * MAX_PUMPS)
  )
}

function computeMetrics(history) {
  const nonPopped = history.filter((h) => !h.popped)
  const avgPumpsNonPopped = nonPopped.length
    ? mean(nonPopped.map((h) => h.pumps))
    : 0
  const totalEarned = history.reduce((sum, h) => sum + h.earned, 0)
  const popRate = history.filter((h) => h.popped).length / history.length
  const pumpVariance = variance(history.map((h) => h.pumps))
  return {
    avgPumpsNonPopped: round(avgPumpsNonPopped, 2),
    totalEarned: round(totalEarned, 2),
    popRate: round(popRate, 3),
    pumpVariance: round(pumpVariance, 2),
  }
}

export default function BalloonGame({ onComplete }) {
  const [thresholds] = useState(generateThresholds)
  const [balloonIndex, setBalloonIndex] = useState(0)
  const [pumpsDisplay, setPumpsDisplay] = useState(0)
  const [popped, setPopped] = useState(false)
  const [history, setHistory] = useState([])

  const pumpsRef = useRef(0)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)

  const threshold = thresholds[balloonIndex]
  const bankedTotal = useMemo(
    () => history.reduce((sum, h) => sum + h.earned, 0),
    [history]
  )
  const currentEarnings = round(pumpsDisplay * CENTS_PER_PUMP, 2)

  useEffect(() => {
    if (history.length !== TOTAL_BALLOONS) return
    const t = setTimeout(() => {
      if (completedRef.current) return
      completedRef.current = true
      onComplete(computeMetrics(history))
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history])

  function goNext() {
    setBalloonIndex((i) => i + 1)
    pumpsRef.current = 0
    setPumpsDisplay(0)
    setPopped(false)
    lockedRef.current = false
  }

  function handlePump() {
    if (lockedRef.current) return
    const next = pumpsRef.current + 1
    pumpsRef.current = next
    setPumpsDisplay(next)
    if (next >= threshold) {
      lockedRef.current = true
      setPopped(true)
      setTimeout(() => {
        setHistory((prev) => [...prev, { pumps: next, popped: true, earned: 0 }])
        goNext()
      }, 850)
    }
  }

  function handleCashOut() {
    if (lockedRef.current || popped) return
    lockedRef.current = true
    const pumps = pumpsRef.current
    const earned = round(pumps * CENTS_PER_PUMP, 2)
    setTimeout(() => {
      setHistory((prev) => [...prev, { pumps, popped: false, earned }])
      goNext()
    }, 350)
  }

  const finished = balloonIndex >= TOTAL_BALLOONS
  const scale = 1 + Math.min(pumpsDisplay, 60) / 60 * 2.3

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Balloon Risk
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">
          Pump the balloon to earn money. Cash out any time — but if it pops,
          you lose what's on this balloon.
        </p>
      </div>

      <div className="flex w-full max-w-md items-center justify-between rounded-xl border border-border bg-card px-5 py-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Balloon</p>
          <p className="font-display text-lg font-semibold text-foreground">
            {Math.min(balloonIndex + 1, TOTAL_BALLOONS)} / {TOTAL_BALLOONS}
          </p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
            <Wallet className="size-3.5" /> Total banked
          </p>
          <p className="font-display text-lg font-semibold text-primary">
            ${bankedTotal.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="relative flex h-64 w-full max-w-md items-center justify-center">
        {!finished ? (
          <AnimatePresence mode="wait">
            {!popped ? (
              <motion.div
                key={`balloon-${balloonIndex}`}
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ scale }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="h-20 w-20 shrink-0 bg-primary shadow-[inset_-8px_-10px_20px_rgba(0,0,0,0.15),inset_8px_8px_16px_rgba(255,255,255,0.25)]"
                  style={{ borderRadius: "50% 50% 50% 50% / 58% 58% 42% 42%" }}
                />
                <div className="mt-1 h-10 w-px bg-muted-foreground/40" />
              </motion.div>
            ) : (
              <motion.div
                key={`pop-${balloonIndex}`}
                className="relative flex items-center justify-center"
                initial={{ scale: 1 }}
              >
                <motion.span
                  initial={{ opacity: 1, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 2.4 }}
                  transition={{ duration: 0.5 }}
                  className="absolute font-display text-4xl font-bold text-destructive"
                >
                  POP!
                </motion.span>
                {Array.from({ length: 10 }).map((_, i) => {
                  const angle = (i / 10) * Math.PI * 2
                  return (
                    <motion.span
                      key={i}
                      className="absolute size-2 rounded-full bg-primary"
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos(angle) * 90,
                        y: Math.sin(angle) * 90,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <p className="text-sm text-muted-foreground">Tallying results…</p>
        )}
      </div>

      {!finished ? (
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            This balloon:{" "}
            <span className="font-semibold text-foreground">
              ${currentEarnings.toFixed(2)}
            </span>{" "}
            ({pumpsDisplay} pump{pumpsDisplay === 1 ? "" : "s"})
          </p>
          <div className="flex w-full gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handlePump}
              disabled={popped}
            >
              Pump
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={handleCashOut}
              disabled={popped}
            >
              Cash out
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
