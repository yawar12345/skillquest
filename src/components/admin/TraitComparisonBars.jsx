import { CHART_COLORS } from "@/lib/chartColors"

export default function TraitComparisonBars({ traits, hasComparison, selectedName }) {
  return (
    <div className="flex flex-col gap-6">
      {traits.map((t) => (
        <div key={t.key}>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{t.label}</span>
            <span className="text-xs text-muted-foreground">{t.metricLabel}</span>
          </div>

          <div className="relative h-2.5 w-full rounded-full bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width]"
              style={{ width: `${t.candidateNormalized ?? 0}%` }}
            />
            {hasComparison && t.averageNormalized != null ? (
              <div
                className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/40"
                style={{ left: `${t.averageNormalized}%` }}
              />
            ) : null}
            {t.selectedNormalized != null ? (
              <div
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
                style={{
                  left: `${t.selectedNormalized}%`,
                  backgroundColor: CHART_COLORS.selected,
                }}
              />
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              This candidate:{" "}
              <strong className="font-semibold text-foreground">
                {t.candidateRaw != null ? t.format(t.candidateRaw) : "—"}
              </strong>
            </span>
            {hasComparison && t.averageRaw != null ? (
              <span>Group average: {t.format(t.averageRaw)}</span>
            ) : null}
            {t.selectedRaw != null ? (
              <span>
                {selectedName}: {t.format(t.selectedRaw)}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
