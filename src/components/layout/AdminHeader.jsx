import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { adminLogout } from "@/lib/storage"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { LogoFull } from "@/components/shared/Logo"

export default function AdminHeader() {
  const navigate = useNavigate()

  async function handleLogout() {
    await adminLogout()
    navigate("/admin/login", { replace: true })
  }

  return (
    <header className="border-b border-border/70 bg-card/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/admin" className="flex items-center gap-2.5">
          <LogoFull className="h-10 w-auto" />
          <span className="font-display text-lg font-semibold tracking-tight">
            SkillQuest
            <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 align-middle text-[0.65rem] font-sans font-medium tracking-wide text-muted-foreground uppercase">
              Admin
            </span>
          </span>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </header>
  )
}
