import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { buildCandidateTraits } from "@/lib/candidateSummary"

export default function ThanksScreen({ candidateName, session }) {
  const traits = session ? buildCandidateTraits(session) : []

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-lg flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mb-6 flex size-16 items-center justify-center rounded-full bg-success/15 text-success"
        >
          <CheckCircle2 className="size-8" />
        </motion.div>
        <h1 className="font-display text-3xl font-semibold text-balance text-foreground sm:text-4xl">
          You're all done{candidateName ? `, ${firstName(candidateName)}` : ""}
        </h1>
        <p className="mt-4 text-balance text-muted-foreground">
          Thanks for taking the time to complete SkillQuest. Your responses
          have been recorded and will be reviewed as part of your
          application.
        </p>

        {traits.length > 0 ? (
          <div className="mt-8 w-full rounded-xl border border-border bg-card p-6 text-left">
            <h2 className="mb-1 font-display text-lg font-semibold text-foreground">
              Your approach, at a glance
            </h2>
            <p className="mb-5 text-sm text-muted-foreground">
              There's no pass or fail here — just a look at how you tended to
              approach each game.
            </p>
            <div className="flex flex-col gap-5">
              {traits.map((t) => (
                <div key={t.key}>
                  <span className="text-sm font-medium text-foreground">
                    {t.label}
                  </span>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${t.percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-6 text-sm text-muted-foreground">
          You can safely close this tab now.
        </p>
      </motion.div>
    </div>
  )
}

function firstName(fullName) {
  return fullName.trim().split(/\s+/)[0]
}
