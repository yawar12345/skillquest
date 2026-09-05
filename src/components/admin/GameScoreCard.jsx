import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GameScoreCard({
  gameDef,
  metrics,
  percentiles,
  hasComparison,
  selectedMetrics,
  selectedName,
}) {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="font-display text-lg font-semibold">
          {gameDef.label}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{gameDef.subtitle}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {gameDef.metrics.map((metric) => {
          const value = metrics?.[metric.key]
          const percentile = percentiles?.[metric.key]
          const selectedValue = selectedMetrics?.[metric.key]
          if (value === undefined || value === null) return null
          return (
            <div key={metric.key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="font-display text-xl font-semibold text-foreground">
                  {metric.format(value)}
                </p>
                {selectedValue !== undefined && selectedValue !== null ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedName}: {metric.format(selectedValue)}
                  </p>
                ) : null}
              </div>
              {hasComparison ? (
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {ordinal(percentile)} percentile
                </span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground italic">
                  No comparison yet
                </span>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}
