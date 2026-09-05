import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function GameIntroScreen({ gameDef, onStart }) {
  const Icon = gameDef.icon

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {gameDef.subtitle}
            </p>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {gameDef.label}
            </h2>
          </div>
        </div>

        <p className="mb-3 text-sm font-medium text-foreground">
          How to play
        </p>
        <ul className="mb-7 flex flex-col gap-2.5">
          {gameDef.instructions.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <Button size="lg" className="w-full" onClick={onStart}>
          Start {gameDef.label}
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>
    </div>
  )
}
