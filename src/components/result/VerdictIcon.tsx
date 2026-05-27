import type { Verdict } from '../../types/decision'

interface VerdictIconProps {
  verdict: Verdict
  className?: string
}

export function VerdictIcon({ verdict, className }: VerdictIconProps) {
  if (verdict === 'ship') return <ShipBoat className={className} />
  if (verdict === 'refine') return <RefineBoat className={className} />
  return <SkipBoat className={className} />
}

// ─── Boat geometry ────────────────────────────────────────────────────────────
//
// All three share the same 64×64 origami boat coordinates:
//   Left fold:  10,48  18,8  32,28  32,48
//   Right fold: 54,48  46,8  32,28  32,48
//   Hull:       10,48  54,48  52,58  12,58
//   Crease:     32,28 → 32,48
//
// Ship   — upright, two-tone panels, confident posture
// Refine — right fold ghosted + dashed crease, suggesting mid-re-fold
// Skip   — entire boat rotated +38° CW around (32,40), capsizing

function ShipBoat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <polygon points="10,48 18,8 32,28 32,48" fill="currentColor" opacity="0.50" />
      <polygon points="54,48 46,8 32,28 32,48" fill="currentColor" />
      <polygon points="10,48 54,48 52,58 12,58" fill="currentColor" opacity="0.72" />
      <line x1="32" y1="28" x2="32" y2="48" stroke="currentColor" strokeWidth="1.5" opacity="0.40" strokeLinecap="round" />
    </svg>
  )
}

function RefineBoat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <g transform="rotate(-14, 32, 40)">
        <polygon points="10,48 18,8 32,28 32,48" fill="currentColor" opacity="0.55" />
        <polygon points="54,48 46,8 32,28 32,48" fill="currentColor" opacity="0.18" />
        <polygon points="54,48 46,8 32,28 32,48" fill="none" stroke="currentColor" strokeWidth="1.75" strokeDasharray="3.5 2.5" strokeLinejoin="round" opacity="0.65" />
        <polygon points="10,48 54,48 52,58 12,58" fill="currentColor" opacity="0.70" />
        <line x1="32" y1="28" x2="32" y2="48" stroke="currentColor" strokeWidth="1.5" opacity="0.40" strokeLinecap="round" strokeDasharray="3 3" />
      </g>
    </svg>
  )
}

function SkipBoat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <g transform="rotate(38, 32, 40)">
        <polygon points="10,48 18,8 32,28 32,48" fill="currentColor" opacity="0.45" />
        <polygon points="54,48 46,8 32,28 32,48" fill="currentColor" opacity="0.75" />
        <polygon points="10,48 54,48 52,58 12,58" fill="currentColor" opacity="0.60" />
        <line x1="32" y1="28" x2="32" y2="48" stroke="currentColor" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
      </g>
    </svg>
  )
}
