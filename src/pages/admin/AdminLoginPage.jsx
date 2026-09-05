import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { adminLogin, isAdminAuthed } from "@/lib/storage"
import { KeyRound, LoaderCircle } from "lucide-react"
import { Navigate } from "react-router-dom"
import { LogoFull } from "@/components/shared/Logo"

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (isAdminAuthed()) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError("")
    const ok = await adminLogin(passcode)
    setLoading(false)
    if (ok) {
      navigate("/admin", { replace: true })
    } else {
      setError("That passcode isn't right. Try again.")
    }
  }

  return (
    <div className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, var(--accent), transparent)",
        }}
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <div className="mb-7 flex flex-col items-center gap-2.5">
          <LogoFull className="h-14 w-auto" />
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            SkillQuest
          </span>
        </div>
        <Card className="w-full border-border/80 shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-1 flex items-center gap-1.5 text-primary">
              <KeyRound className="size-4" />
            </div>
            <CardTitle className="font-display text-2xl font-semibold">
              Admin access
            </CardTitle>
            <CardDescription>
              Enter the passcode to view SkillQuest results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  autoFocus
                  autoComplete="current-password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                />
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
              </div>
              <Button type="submit" disabled={loading || !passcode} size="lg">
                {loading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
