import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import WelcomeScreen from "@/components/candidate/WelcomeScreen"
import ThanksScreen from "@/components/candidate/ThanksScreen"
import GameProgressHeader from "@/components/candidate/GameProgressHeader"
import GameIntroScreen from "@/components/candidate/GameIntroScreen"
import BalloonGame from "@/games/BalloonGame"
import MemoryGridGame from "@/games/MemoryGridGame"
import CardSortGame from "@/games/CardSortGame"
import ReactionGame from "@/games/ReactionGame"
import {
  getSession,
  startSession,
  saveGameResult,
  completeSession,
} from "@/lib/storage"
import { GAME_ORDER, GAME_DEFS } from "@/lib/gameConfig"
import { AlertTriangle } from "lucide-react"

const GAME_COMPONENTS = {
  balloon: BalloonGame,
  memory: MemoryGridGame,
  cardSort: CardSortGame,
  reaction: ReactionGame,
}

export default function AssessmentPage() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(undefined) // undefined = loading, null = not found
  const [starting, setStarting] = useState(false)
  const [gameReady, setGameReady] = useState(false)

  const gameKey =
    session && session.status === "in_progress"
      ? GAME_ORDER[Math.min(session.currentGameIndex, GAME_ORDER.length - 1)]
      : null

  // Show the "how to play" intro again each time the active game changes
  // (including after a refresh, since that game hadn't saved progress yet).
  useEffect(() => {
    setGameReady(false)
  }, [gameKey])

  const load = useCallback(async () => {
    const s = await getSession(sessionId)
    setSession(s)
  }, [sessionId])

  useEffect(() => {
    load()
  }, [load])

  async function handleStart({ name, email, position }) {
    setStarting(true)
    const updated = await startSession(sessionId, { name, email, position })
    setSession(updated)
    setStarting(false)
  }

  async function handleGameComplete(key, metrics) {
    const updated = await saveGameResult(sessionId, key, metrics)
    if (updated.currentGameIndex >= GAME_ORDER.length) {
      const completed = await completeSession(sessionId)
      setSession(completed)
    } else {
      setSession(updated)
    }
  }

  if (session === undefined) {
    return <CenteredMessage>Loading your assessment…</CenteredMessage>
  }

  if (session === null) {
    return (
      <CenteredMessage>
        <AlertTriangle className="mb-3 size-6 text-muted-foreground" />
        This assessment link isn&apos;t valid. Please check the link your
        recruiter sent you, or reach out to them for a new one.
      </CenteredMessage>
    )
  }

  if (session.status === "pending") {
    return (
      <div className="flex min-h-svh flex-1 flex-col bg-background">
        <WelcomeScreen onStart={handleStart} starting={starting} />
      </div>
    )
  }

  if (session.status === "completed") {
    return (
      <div className="flex min-h-svh flex-1 flex-col bg-background">
        <ThanksScreen candidateName={session.candidateName} session={session} />
      </div>
    )
  }

  // in_progress
  const gameDef = GAME_DEFS[gameKey]
  const GameComponent = GAME_COMPONENTS[gameKey]

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-background">
      <GameProgressHeader currentIndex={session.currentGameIndex} />
      {gameReady ? (
        <GameComponent
          key={`${sessionId}-${gameKey}`}
          onComplete={(metrics) => handleGameComplete(gameKey, metrics)}
        />
      ) : (
        <GameIntroScreen
          key={`intro-${gameKey}`}
          gameDef={gameDef}
          onStart={() => setGameReady(true)}
        />
      )}
    </div>
  )
}

function CenteredMessage({ children }) {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center bg-background px-6 text-center text-muted-foreground">
      {children}
    </div>
  )
}
