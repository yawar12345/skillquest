import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createSession } from "@/lib/storage"
import { Check, Copy, Link2 } from "lucide-react"

export default function GenerateLinkDialog({ open, onOpenChange, onCreated }) {
  const [url, setUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)
  const requestedRef = useRef(false)

  // Create the session as soon as the dialog is asked to open (whatever
  // triggered that — a plain button in the parent, not just internal
  // Dialog interactions, which is all `onOpenChange` would catch).
  useEffect(() => {
    if (open && !requestedRef.current) {
      requestedRef.current = true
      setCreating(true)
      createSession().then((session) => {
        setUrl(`${window.location.origin}/assessment/${session.id}`)
        setCreating(false)
        onCreated?.(session)
      })
    }
    if (!open) {
      requestedRef.current = false
      const t = setTimeout(() => {
        setUrl("")
        setCopied(false)
      }, 150)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API unavailable; user can still select and copy manually.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Link2 className="size-4" />
          </div>
          <DialogTitle className="font-display text-lg">
            Candidate link ready
          </DialogTitle>
          <DialogDescription>
            Share this unique link with the candidate. It's good for one
            assessment session.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={creating ? "Generating…" : url}
            onFocus={(e) => e.target.select()}
            className="font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!url}
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
