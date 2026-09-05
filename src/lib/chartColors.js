// Static hex fallbacks for Recharts (SVG fill/stroke need a resolvable
// color; these are hand-picked to match the --primary / --muted-foreground
// tokens in index.css so charts stay inside the warm-neutral + blue palette.
export const CHART_COLORS = {
  candidate: "#2f4d92",
  average: "#8992a3",
  selected: "#7ea1e0",
  grid: "#dde3ea",
}
