import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Timer,
  ShieldCheck,
  Mail,
  ArrowRight,
  Gamepad2,
  Brain,
  Grid3x3,
  Zap,
} from "lucide-react"
import { LogoFull } from "@/components/shared/Logo"
import { POSITIONS } from "@/lib/positions"

const TRAITS = [
  { icon: Gamepad2, label: "Risk tolerance" },
  { icon: Brain, label: "Working memory" },
  { icon: Grid3x3, label: "Cognitive flexibility" },
  { icon: Zap, label: "Processing speed" },
]

export default function WelcomeScreen({ onStart, starting }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [position, setPosition] = useState("")
  const [touched, setTouched] = useState(false)

  const nameValid = name.trim().length > 1
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const positionValid = position !== ""
  const canSubmit = nameValid && emailValid && positionValid

  function handleSubmit(e) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit || starting) return
    onStart({ name: name.trim(), email: email.trim(), position })
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-background px-4 py-12 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent), transparent)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="mb-8 text-center">
          <LogoFull className="mx-auto mb-5 h-14 w-auto" />
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Let's see how you think
          </h1>
          <p className="mx-auto mt-4 max-w-md text-balance text-muted-foreground">
            SkillQuest is a short set of interactive games that measure how
            you approach risk, memory, patterns, and speed — the same
            behavioral signals a good interview would try to draw out.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TRAITS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-4 text-center"
            >
              <Icon className="size-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-around sm:gap-6">
          <InfoRow icon={Timer} text="Takes about 10–12 minutes" />
          <InfoRow
            icon={ShieldCheck}
            text="No right or wrong answers — we're looking at approach, not outcome"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="candidate-name">Full name</Label>
            <Input
              id="candidate-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Rivera"
              autoComplete="name"
              aria-invalid={touched && !nameValid}
            />
            {touched && !nameValid ? (
              <p className="text-xs text-destructive">
                Enter your full name.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="candidate-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="candidate-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@email.com"
                autoComplete="email"
                className="pl-9"
                aria-invalid={touched && !emailValid}
              />
            </div>
            {touched && !emailValid ? (
              <p className="text-xs text-destructive">
                Enter a valid email address.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="candidate-position">Position you're applying for</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger
                id="candidate-position"
                className="w-full"
                aria-invalid={touched && !positionValid}
              >
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched && !positionValid ? (
              <p className="text-xs text-destructive">
                Select the position you're applying for.
              </p>
            ) : null}
          </div>
          <Button type="submit" size="lg" className="mt-2" disabled={starting}>
            {starting ? "Starting…" : "Start assessment"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need a different way to show your skills?{" "}
          <a
            href="mailto:hiring@skillquest.example?subject=Alternative%20assessment%20format%20request"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Request an alternative assessment format
          </a>
        </p>
      </motion.div>
    </div>
  )
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0 text-primary" />
      <span>{text}</span>
    </div>
  )
}
