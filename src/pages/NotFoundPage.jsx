import { Link } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button"
import { Compass } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="max-w-sm text-balance text-muted-foreground">
        This link doesn&apos;t lead anywhere. Double check the URL, or head
        back to the admin dashboard.
      </p>
      <Link to="/admin" className={buttonVariants({ className: "mt-2" })}>
        Go to admin
      </Link>
    </div>
  )
}
