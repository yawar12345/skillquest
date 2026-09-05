import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Circle, Diamond, Square, Triangle } from "lucide-react"
import { mean, round } from "@/lib/metrics"
import { cn } from "@/lib/utils"

const RULES = ["color", "shape", "number"]
const COLORS = ["rust", "moss", "slate", "gold"]
const SHAPES = ["circle", "square", "triangle", "diamond"]
const SHAPE_ICONS = { circle: Circle, square: Square, triangle: Triangle, diamond: Diamond }
const COLOR_CLASSES = {
  rust: "text-primary",
  moss: "text-[oklch(0.5_0.09_140)]",
  slate: "text-[oklch(0.48_0.05_255)]",
  gold: "text-[oklch(0.68_0.13_85)]",
}

const REFERENCE_CARDS = [
  { color: "rust", shape: "triangle", number: 1 },
  { color: "moss", shape: "diamond", number: 2 },
  { color: "slate", shape: "circle", number: 3 },
  { color: "gold", shape: "square", number: 4 },
]

const STREAK_TO_ADVANCE = 8
const MAX_TRIALS = 24
const FEEDBACK_MS = 550

function randomCard() {
  return {
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    number: 1 + Math.floor(Math.random() * 4),
  }
}

function correctPileFor(card, rule) {
  return REFERENCE_CARDS.findIndex((ref) => ref[rule] === card[rule])
}

export default function CardSortGame({ onComplete }) {
  const [trial, setTrial] = useState(1)
  const [card, setCard] = useState(randomCard)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'incorrect' | null
  const [chosenPile, setChosenPile] = useState(null)

  const ruleIndexRef = useRef(0)
  const previousRuleIndexRef = useRef(null)
  const streakRef = useRef(0)
  const correctCountRef = useRef(0)
  const ruleChangesRef = useRef(0)
  const ruleChangesAdaptedRef = useRef(0)
  const gotCorrectSinceChangeRef = useRef(true)
  const perseverationErrorsRef = useRef(0)
  const timesRef = useRef([])
  const cardShownAtRef = useRef(Date.now())
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    cardShownAtRef.current = Date.now()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [card])

  function finishGame() {
    if (completedRef.current) return
    completedRef.current = true
    onComplete({
      totalCorrectSorts: correctCountRef.current,
      ruleChangesAdapted: ruleChangesAdaptedRef.current,
      perseverationErrors: perseverationErrorsRef.current,
      avgTimePerSortMs: timesRef.current.length
        ? round(mean(timesRef.current), 0)
        : 0,
    })
  }

  function handleSort(pileIndex) {
    if (lockedRef.current) return
    lockedRef.current = true

    const elapsed = Date.now() - cardShownAtRef.current
    timesRef.current.push(elapsed)

    const rule = RULES[ruleIndexRef.current]
    const correctPile = correctPileFor(card, rule)
    const isCorrect = pileIndex === correctPile

    // Perseveration: sorting by the rule that was correct before the most
    // recent change, right when that choice is now wrong.
    if (!isCorrect && previousRuleIndexRef.current !== null) {
      const oldRule = RULES[previousRuleIndexRef.current]
      if (pileIndex === correctPileFor(card, oldRule)) {
        perseverationErrorsRef.current += 1
      }
    }

    setChosenPile(pileIndex)
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) {
      correctCountRef.current += 1
      streakRef.current += 1
      if (!gotCorrectSinceChangeRef.current) {
        ruleChangesAdaptedRef.current += 1
        gotCorrectSinceChangeRef.current = true
      }
    } else {
      streakRef.current = 0
    }

    const willAdvanceRule = streakRef.current >= STREAK_TO_ADVANCE
    const nextTrial = trial + 1

    timeoutRef.current = setTimeout(() => {
      if (nextTrial > MAX_TRIALS) {
        finishGame()
        return
      }
      if (willAdvanceRule) {
        previousRuleIndexRef.current = ruleIndexRef.current
        ruleIndexRef.current = (ruleIndexRef.current + 1) % RULES.length
        streakRef.current = 0
        ruleChangesRef.current += 1
        gotCorrectSinceChangeRef.current = false
      }
      setCard(randomCard())
      setFeedback(null)
      setChosenPile(null)
      setTrial(nextTrial)
      lockedRef.current = false
    }, FEEDBACK_MS)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Card Sort
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">
          Sort each card into one of the four piles. You'll find out if
          you're right after each try — the sorting rule may change without
          warning.
        </p>
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        Card {trial} / {MAX_TRIALS}
      </p>

      <div className="grid w-full max-w-lg grid-cols-4 gap-2 sm:gap-4">
        {REFERENCE_CARDS.map((ref, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSort(i)}
            disabled={lockedRef.current}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-3 transition-colors hover:border-primary/50 disabled:pointer-events-none sm:p-4",
              chosenPile === i && feedback === "correct" && "border-success bg-success/10",
              chosenPile === i && feedback === "incorrect" && "border-destructive bg-destructive/10"
            )}
          >
            <CardFace card={ref} size="sm" />
            <span className="text-[0.65rem] text-muted-foreground">Pile {i + 1}</span>
          </button>
        ))}
      </div>

      <div className="relative flex h-32 w-24 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={trial}
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="flex h-32 w-24 flex-col items-center justify-center gap-2 rounded-xl border-2 border-foreground/20 bg-card p-3 shadow-sm"
          >
            <CardFace card={card} size="lg" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-5 text-sm font-medium">
        {feedback === "correct" && <span className="text-success">Correct</span>}
        {feedback === "incorrect" && <span className="text-destructive">Incorrect</span>}
      </div>
    </div>
  )
}

function CardFace({ card, size }) {
  const Icon = SHAPE_ICONS[card.shape]
  const iconSize = size === "lg" ? "size-5" : "size-3.5"
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-1", size === "lg" && "gap-1.5")}>
      {Array.from({ length: card.number }).map((_, i) => (
        <Icon key={i} className={cn(iconSize, COLOR_CLASSES[card.color])} fill="currentColor" />
      ))}
    </div>
  )
}
