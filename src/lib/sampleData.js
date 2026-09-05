// Ready-made candidates with deliberately varied performance profiles, so a
// fresh admin dashboard has something meaningful to compare instead of an
// empty state. Two positions are represented so the position-based
// comparison filter has more than one candidate per role to work with.

export const SAMPLE_CANDIDATES = [
  {
    candidateName: "Jordan Lee",
    candidateEmail: "jordan.lee@example.com",
    position: "Sales Representative",
    durationMinutes: 9,
    games: {
      balloon: { avgPumpsNonPopped: 22.4, totalEarned: 14.85, popRate: 0.35, pumpVariance: 42.1 },
      memory: { maxSequenceLength: 7, totalCorrectRounds: 6, avgResponseTimeMs: 1450 },
      cardSort: { totalCorrectSorts: 19, ruleChangesAdapted: 3, perseverationErrors: 2, avgTimePerSortMs: 1380 },
      reaction: { avgReactionTimeMs: 340, reactionTimeStdDevMs: 55, falseClickRate: 0.05 },
    },
  },
  {
    candidateName: "Casey Morgan",
    candidateEmail: "casey.morgan@example.com",
    position: "Sales Representative",
    durationMinutes: 12,
    games: {
      balloon: { avgPumpsNonPopped: 13.1, totalEarned: 8.4, popRate: 0.4, pumpVariance: 30.6 },
      memory: { maxSequenceLength: 5, totalCorrectRounds: 4, avgResponseTimeMs: 1920 },
      cardSort: { totalCorrectSorts: 14, ruleChangesAdapted: 2, perseverationErrors: 4, avgTimePerSortMs: 1850 },
      reaction: { avgReactionTimeMs: 430, reactionTimeStdDevMs: 90, falseClickRate: 0.1 },
    },
  },
  {
    candidateName: "Taylor Brooks",
    candidateEmail: "taylor.brooks@example.com",
    position: "Sales Representative",
    durationMinutes: 15,
    games: {
      balloon: { avgPumpsNonPopped: 6.8, totalEarned: 4.2, popRate: 0.15, pumpVariance: 9.4 },
      memory: { maxSequenceLength: 4, totalCorrectRounds: 3, avgResponseTimeMs: 2380 },
      cardSort: { totalCorrectSorts: 10, ruleChangesAdapted: 1, perseverationErrors: 7, avgTimePerSortMs: 2600 },
      reaction: { avgReactionTimeMs: 560, reactionTimeStdDevMs: 150, falseClickRate: 0.2 },
    },
  },
  {
    candidateName: "Avery Kim",
    candidateEmail: "avery.kim@example.com",
    position: "Software Engineer",
    durationMinutes: 10,
    games: {
      balloon: { avgPumpsNonPopped: 15.6, totalEarned: 10.1, popRate: 0.2, pumpVariance: 18.3 },
      memory: { maxSequenceLength: 9, totalCorrectRounds: 8, avgResponseTimeMs: 1180 },
      cardSort: { totalCorrectSorts: 22, ruleChangesAdapted: 4, perseverationErrors: 1, avgTimePerSortMs: 1120 },
      reaction: { avgReactionTimeMs: 305, reactionTimeStdDevMs: 48, falseClickRate: 0.0 },
    },
  },
  {
    candidateName: "Riley Chen",
    candidateEmail: "riley.chen@example.com",
    position: "Software Engineer",
    durationMinutes: 11,
    games: {
      balloon: { avgPumpsNonPopped: 11.2, totalEarned: 7.3, popRate: 0.3, pumpVariance: 24.7 },
      memory: { maxSequenceLength: 6, totalCorrectRounds: 5, avgResponseTimeMs: 1640 },
      cardSort: { totalCorrectSorts: 16, ruleChangesAdapted: 2, perseverationErrors: 3, avgTimePerSortMs: 1590 },
      reaction: { avgReactionTimeMs: 385, reactionTimeStdDevMs: 70, falseClickRate: 0.05 },
    },
  },
  {
    candidateName: "Morgan Patel",
    candidateEmail: "morgan.patel@example.com",
    position: "Software Engineer",
    durationMinutes: 14,
    games: {
      balloon: { avgPumpsNonPopped: 8.4, totalEarned: 5.1, popRate: 0.45, pumpVariance: 33.9 },
      memory: { maxSequenceLength: 4, totalCorrectRounds: 3, avgResponseTimeMs: 2210 },
      cardSort: { totalCorrectSorts: 11, ruleChangesAdapted: 1, perseverationErrors: 6, avgTimePerSortMs: 2340 },
      reaction: { avgReactionTimeMs: 505, reactionTimeStdDevMs: 130, falseClickRate: 0.15 },
    },
  },
]
