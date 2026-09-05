import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { mean, round } from "@/lib/metrics"
import { cn } from "@/lib/utils"

const GRID_SIZE = 16
const START_LENGTH = 3
const MAX_ROUNDS = 10
const MAX_FAILURES = 2
const LIGHT_ON_MS = 550
const LIGHT_GAP_MS = 220

function randomSequence(length) {
  const pool = Array.from({ length: GRID_SIZE }, (_, i) => i)
  const seq = []
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    seq.push(pool.splice(idx, 1)[0])
  }
  return seq
}

export default function MemoryGridGame({ onComplete }) {
  const [roundNumber, setRoundNumber] = useState(1)
  const [length, setLength] = useState(START_LENGTH)
  const [sequence, setSequence] = useState(() => randomSequence(START_LENGTH))
  const [phase, setPhase] = useState("showing") // showing | input | feedback
  const [litCell, setLitCell] = useState(null)
  const [userInput, setUserInput] = useState([])
  const [feedback, setFeedback] = useState(null) // 'correct' | 'incorrect'

  const failuresRef = useRef(0)
  const correctRoundsRef = useRef(0)
  const maxLengthRef = useRef(0)
  const responseTimesRef = useRef([])
  const inputStartRef = useRef(0)
  const resolvingRef = useRef(false)
  const completedRef = useRef(false)
  const timeoutsRef = useRef([])
  const inputRef = useRef([])

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  // Play the sequence whenever we enter the "showing" phase for a round.
  useEffect(() => {
    if (phase !== "showing") return
    inputRef.current = []
    setUserInput([])
    resolvingRef.current = false
    let cancelled = false

    sequence.forEach((cell, i) => {
      schedule(() => {
        if (cancelled) return
        setLitCell(cell)
        schedule(() => {
          if (cancelled) return
          setLitCell(null)
        }, LIGHT_ON_MS - 100)
      }, i * (LIGHT_ON_MS + LIGHT_GAP_MS))
    })

    schedule(() => {
      if (cancelled) return
      setPhase("input")
      inputStartRef.current = Date.now()
    }, sequence.length * (LIGHT_ON_MS + LIGHT_GAP_MS))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sequence])

  function finishGame() {
    if (completedRef.current) return
    completedRef.current = true
    onComplete({
      maxSequenceLength: maxLengthRef.current,
      totalCorrectRounds: correctRoundsRef.current,
      avgResponseTimeMs: responseTimesRef.current.length
        ? round(mean(responseTimesRef.current), 0)
        : 0,
    })
  }

  function resolveRound(success) {
    if (resolvingRef.current) return
    resolvingRef.current = true
    const elapsed = Date.now() - inputStartRef.current
    responseTimesRef.current.push(elapsed)

    if (success) {
      correctRoundsRef.current += 1
      maxLengthRef.current = Math.max(maxLengthRef.current, length)
    } else {
      failuresRef.current += 1
    }
    setFeedback(success ? "correct" : "incorrect")

    schedule(() => {
      const gameOver =
        failuresRef.current >= MAX_FAILURES || roundNumber >= MAX_ROUNDS
      if (gameOver) {
        finishGame()
        return
      }
      const nextLength = success ? length + 1 : length
      setLength(nextLength)
      setSequence(randomSequence(nextLength))
      setRoundNumber((r) => r + 1)
      setFeedback(null)
      setPhase("showing")
    }, 750)
  }

  function handleCellClick(cellIndex) {
    if (phase !== "input" || resolvingRef.current) return
    const position = inputRef.current.length
    inputRef.current = [...inputRef.current, cellIndex]
    setUserInput(inputRef.current)
    if (sequence[position] !== cellIndex) {
      resolveRound(false)
      return
    }
    if (inputRef.current.length === sequence.length) {
      resolveRound(true)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Memory Grid
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">
          Watch the sequence light up, then repeat it by clicking the cells in
          the same order.
        </p>
      </div>

      <div className="flex w-full max-w-xs items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Round {Math.min(roundNumber, MAX_ROUNDS)} / {MAX_ROUNDS}
        </span>
        <span
          className={cn(
            "font-medium",
            phase === "showing" && "text-muted-foreground",
            phase === "input" && "text-primary"
          )}
        >
          {phase === "showing" ? "Watch closely…" : "Your turn"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: GRID_SIZE }).map((_, i) => {
          const isLit = litCell === i
          const isClicked = phase !== "showing" && userInput.includes(i)
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => handleCellClick(i)}
              disabled={phase !== "input"}
              whileTap={phase === "input" ? { scale: 0.92 } : undefined}
              className={cn(
                "size-14 rounded-lg border border-border bg-muted transition-colors duration-150 sm:size-16",
                isLit && "border-primary bg-primary",
                isClicked && !isLit && "bg-accent",
                feedback === "correct" && "border-success",
                feedback === "incorrect" && "border-destructive"
              )}
              aria-label={`Cell ${i + 1}`}
            />
          )
        })}
      </div>

      <div className="h-5 text-sm font-medium">
        {feedback === "correct" && (
          <span className="text-success">Correct sequence!</span>
        )}
        {feedback === "incorrect" && (
          <span className="text-destructive">Not quite.</span>
        )}
      </div>
    </div>
  )
}
