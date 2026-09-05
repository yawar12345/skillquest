import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { CHART_COLORS } from "@/lib/chartColors"

export default function RadarComparisonChart({ data, selectedName }) {
  const hasSelected = data.some((d) => d.selected != null)

  return (
    <div className="w-full">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            outerRadius="65%"
            margin={{ top: 8, right: 24, bottom: 8, left: 24 }}
          >
            <PolarGrid stroke={CHART_COLORS.grid} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
              }}
              formatter={(value) => `${Math.round(value)}`}
            />
            <Radar
              name="This candidate"
              dataKey="candidate"
              stroke={CHART_COLORS.candidate}
              fill={CHART_COLORS.candidate}
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name="Group average"
              dataKey="average"
              stroke={CHART_COLORS.average}
              fill={CHART_COLORS.average}
              fillOpacity={0.12}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            {hasSelected ? (
              <Radar
                name={selectedName}
                dataKey="selected"
                stroke={CHART_COLORS.selected}
                fill={CHART_COLORS.selected}
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="2 2"
              />
            ) : null}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <Legend swatch={CHART_COLORS.candidate} label="This candidate" />
        <Legend swatch={CHART_COLORS.average} label="Group average" dashed />
        {hasSelected ? (
          <Legend swatch={CHART_COLORS.selected} label={selectedName} dashed />
        ) : null}
      </div>
    </div>
  )
}

function Legend({ swatch, label, dashed }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-0.5 w-4 rounded-full"
        style={{
          backgroundColor: dashed ? "transparent" : swatch,
          borderTop: dashed ? `2px dashed ${swatch}` : undefined,
        }}
      />
      {label}
    </span>
  )
}
