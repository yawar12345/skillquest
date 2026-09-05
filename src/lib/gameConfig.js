import { Gamepad2, Brain, Grid3x3, Zap } from "lucide-react"

// Central registry of the 4 games: display metadata + the metrics each one
// reports. `isRadarPrimary` marks the single headline metric used as that
// game's axis on the admin radar chart (all metrics get percentiled onto a
// shared 0-100 scale so units never mix).

export const GAME_ORDER = ["balloon", "memory", "cardSort", "reaction"]

export const GAME_DEFS = {
  balloon: {
    key: "balloon",
    label: "Balloon Risk",
    subtitle: "Risk tolerance",
    radarLabel: "Risk",
    icon: Gamepad2,
    instructions: [
      "Pump the balloon to add 5¢ to its balloon bank.",
      "Cash out any time to move that balloon's earnings to your total.",
      "Every balloon has a hidden limit — if it pops before you cash out, you lose what's on it.",
      "20 balloons, one at a time. There's no way to know a balloon's limit in advance.",
    ],
    metrics: [
      {
        key: "avgPumpsNonPopped",
        label: "Avg. pumps (unpopped balloons)",
        format: (v) => v.toFixed(1),
        higherIsBetter: true,
        isRadarPrimary: true,
      },
      {
        key: "totalEarned",
        label: "Total earned",
        format: (v) => `$${v.toFixed(2)}`,
        higherIsBetter: true,
      },
      {
        key: "popRate",
        label: "Pop rate",
        format: (v) => `${Math.round(v * 100)}%`,
        higherIsBetter: true,
      },
      {
        key: "pumpVariance",
        label: "Pump-count variance",
        format: (v) => v.toFixed(1),
        higherIsBetter: true,
      },
    ],
  },
  memory: {
    key: "memory",
    label: "Memory Grid",
    subtitle: "Working memory",
    radarLabel: "Memory",
    icon: Brain,
    instructions: [
      "Watch a sequence of cells light up on the 4×4 grid.",
      "Once it stops, click the cells back in the exact same order.",
      "Each round the sequence grows by one cell.",
      "The game ends after two missed rounds, or after round 10 — whichever comes first.",
    ],
    metrics: [
      {
        key: "maxSequenceLength",
        label: "Max sequence length",
        format: (v) => `${v}`,
        higherIsBetter: true,
        isRadarPrimary: true,
      },
      {
        key: "totalCorrectRounds",
        label: "Correct rounds",
        format: (v) => `${v}`,
        higherIsBetter: true,
      },
      {
        key: "avgResponseTimeMs",
        label: "Avg. response time",
        format: (v) => `${Math.round(v)} ms`,
        higherIsBetter: false,
      },
    ],
  },
  cardSort: {
    key: "cardSort",
    label: "Card Sort",
    subtitle: "Cognitive flexibility",
    radarLabel: "Patterns",
    icon: Grid3x3,
    instructions: [
      "Each card has a color, a shape, and a number of shapes on it.",
      "Sort it into one of the 4 piles — you'll be told right away if you were correct.",
      "There's a hidden rule based on color, shape, or number. Use the feedback to figure it out.",
      "The rule can change without warning, so stay alert and adjust.",
    ],
    metrics: [
      {
        key: "totalCorrectSorts",
        label: "Correct sorts",
        format: (v) => `${v}`,
        higherIsBetter: true,
        isRadarPrimary: true,
      },
      {
        key: "ruleChangesAdapted",
        label: "Rule changes adapted to",
        format: (v) => `${v}`,
        higherIsBetter: true,
      },
      {
        key: "perseverationErrors",
        label: "Perseveration errors",
        format: (v) => `${v}`,
        higherIsBetter: false,
      },
      {
        key: "avgTimePerSortMs",
        label: "Avg. time per sort",
        format: (v) => `${Math.round(v)} ms`,
        higherIsBetter: false,
      },
    ],
  },
  reaction: {
    key: "reaction",
    label: "Reaction Speed",
    subtitle: "Processing speed",
    radarLabel: "Speed",
    icon: Zap,
    instructions: [
      "A blue circle will appear at a random spot on the board — click it as fast as you can.",
      "Sometimes a gray circle appears instead. Don't click it — that's a decoy.",
      "20 quick trials in total. Both speed and accuracy are measured.",
    ],
    metrics: [
      {
        key: "avgReactionTimeMs",
        label: "Avg. reaction time",
        format: (v) => `${Math.round(v)} ms`,
        higherIsBetter: false,
        isRadarPrimary: true,
      },
      {
        key: "reactionTimeStdDevMs",
        label: "Reaction time std. dev.",
        format: (v) => `${Math.round(v)} ms`,
        higherIsBetter: false,
      },
      {
        key: "falseClickRate",
        label: "False-click rate (decoys)",
        format: (v) => `${Math.round(v * 100)}%`,
        higherIsBetter: false,
      },
    ],
  },
}
