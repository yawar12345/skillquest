import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import AdminHeader from "@/components/layout/AdminHeader"
import GenerateLinkDialog from "@/components/admin/GenerateLinkDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  listSessions,
  getCompletedSessions,
  seedSampleSessions,
} from "@/lib/storage"
import { sessionsToCsv, downloadCsv } from "@/lib/csv"
import { ChevronRight, Download, FlaskConical, Plus, Users } from "lucide-react"

const STATUS_LABEL = {
  pending: "Link sent",
  in_progress: "In progress",
  completed: "Completed",
}

const STATUS_VARIANT = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
}

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [positionFilter, setPositionFilter] = useState("all")

  async function refresh() {
    setLoading(true)
    const all = await listSessions()
    setSessions(all)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleExport() {
    const completed = await getCompletedSessions()
    if (completed.length === 0) return
    const csv = sessionsToCsv(completed)
    downloadCsv(
      `skillquest-results-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    )
  }

  async function handleSeed() {
    setSeeding(true)
    await seedSampleSessions()
    await refresh()
    setSeeding(false)
  }

  const hasCompleted = sessions.some((s) => s.status === "completed")

  const positions = useMemo(
    () => [...new Set(sessions.map((s) => s.position).filter(Boolean))],
    [sessions]
  )

  const filteredSessions =
    positionFilter === "all"
      ? sessions
      : sessions.filter((s) => s.position === positionFilter)

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-background">
      <AdminHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Candidates
            </h1>
            <p className="mt-1 text-muted-foreground">
              Generate assessment links and review completed sessions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleSeed} disabled={seeding}>
              <FlaskConical className="size-4" />
              {seeding ? "Adding…" : "Add sample candidates"}
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!hasCompleted}>
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              Generate link
            </Button>
          </div>
        </div>

        {positions.length > 1 ? (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Position</span>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All positions</SelectItem>
                {positions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Loading sessions…
            </div>
          ) : filteredSessions.length === 0 ? (
            <EmptyState onGenerate={() => setDialogOpen(true)} />
          ) : (
            <>
              {/* Card list below sm — a 6-column table has no room on a phone screen. */}
              <div className="divide-y divide-border sm:hidden">
                {filteredSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>

              <Table className="hidden sm:table">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="text-right">Results</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {session.candidateName || (
                              <span className="text-muted-foreground italic">
                                Not started
                              </span>
                            )}
                          </span>
                          {session.candidateEmail ? (
                            <span className="text-xs text-muted-foreground">
                              {session.candidateEmail}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.position || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[session.status]}>
                          {STATUS_LABEL[session.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(session.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.completedAt
                          ? formatDate(session.completedAt)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {session.status === "completed" ? (
                          <Link
                            to={`/admin/sessions/${session.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View results
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </main>

      <GenerateLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={refresh}
      />
    </div>
  )
}

function SessionCard({ session }) {
  const content = (
    <div className="flex items-center justify-between gap-3 px-4 py-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">
          {session.candidateName || (
            <span className="text-muted-foreground italic">Not started</span>
          )}
        </p>
        {session.candidateEmail ? (
          <p className="truncate text-xs text-muted-foreground">
            {session.candidateEmail}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge variant={STATUS_VARIANT[session.status]}>
            {STATUS_LABEL[session.status]}
          </Badge>
          {session.position ? (
            <span className="text-xs text-muted-foreground">
              {session.position}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            Created {formatDate(session.createdAt)}
          </span>
        </div>
      </div>
      {session.status === "completed" ? (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
    </div>
  )

  if (session.status === "completed") {
    return (
      <Link to={`/admin/sessions/${session.id}`} className="block hover:bg-muted/40">
        {content}
      </Link>
    )
  }
  return content
}

function EmptyState({ onGenerate }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Users className="size-5" />
      </div>
      <div>
        <p className="font-medium text-foreground">No candidates yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Generate a link to send your first candidate through the
          assessment.
        </p>
      </div>
      <Button className="mt-2" onClick={onGenerate}>
        <Plus className="size-4" />
        Generate link
      </Button>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
