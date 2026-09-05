import { Progress } from "@/components/ui/progress"
import { GAME_ORDER, GAME_DEFS } from "@/lib/gameConfig"
import { cn } from "@/lib/utils"
import LogoMark from "@/components/shared/Logo"

export default function GameProgressHeader({ currentIndex }) {
  const percent = (currentIndex / GAME_ORDER.length) * 100

  return (
    <header className="border-b border-border/70 bg-card/60 px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LogoMark className="size-3.5" />
            </span>
            <span className="font-display text-sm font-semibold tracking-tight text-foreground">
              SkillQuest
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Step {Math.min(currentIndex + 1, GAME_ORDER.length)} of{" "}
            {GAME_ORDER.length}
          </span>
        </div>
        <Progress value={percent} />
        <div className="hidden gap-2 sm:flex">
          {GAME_ORDER.map((key, i) => (
            <div
              key={key}
              className={cn(
                "flex-1 truncate rounded-md px-2 py-1 text-center text-[0.7rem] font-medium",
                i < currentIndex && "text-primary",
                i === currentIndex && "bg-muted text-foreground",
                i > currentIndex && "text-muted-foreground/60"
              )}
            >
              {GAME_DEFS[key].label}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
