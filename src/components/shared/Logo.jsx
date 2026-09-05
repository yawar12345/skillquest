import logoImage from "@/assets/logo-skillquest.png"

// Custom flat mark for SkillQuest: a winding quest trail with waypoint
// markers leading up to a magnifying glass — "the trail of an assessment" —
// drawn in the same stroke-based style as the lucide-react icon set so it
// sits naturally next to them inside small colored badges.
export default function LogoMark({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 19 L8.5 13.5 L12.5 15.5" />
      <circle cx="17.3" cy="9" r="3.3" />
      <path d="M19.6 11.3 L21.8 13.5" />
      <circle cx="3.5" cy="19" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

// The actual brand mark, cropped and background-removed from the marketing
// poster, for large first-impression placements — the candidate welcome
// screen and the admin login screen. A raster image reads a lot better than
// a vector reinterpretation here, but it turns to mud below ~48px, so it
// should never be dropped into the small nav badges that use LogoMark.
export function LogoFull({ className, ...props }) {
  return (
    <img
      src={logoImage}
      alt="SkillQuest"
      className={className}
      {...props}
    />
  )
}
