import { clamp, easeCinematic } from '../animation/ease'

const ELEMENTS = [
  { label: 'Nam Hom grove', ja: 'ナムホームの畑', x: 300, y: 250 },
  { label: 'Skilled harvesting', ja: '熟練の収穫', x: 250, y: 610 },
  { label: 'Bangkok flagship', ja: 'バンコク旗艦店', x: 800, y: 790 },
  { label: 'Cutting ritual', ja: '目の前の儀式', x: 1350, y: 610 },
  { label: 'Thailand–Japan connection', ja: 'タイと日本をつなぐ', x: 1300, y: 250 },
]

const CENTRE = { x: 800, y: 450 }

interface BrandSystemProps {
  /** Seconds into chapter 7's cinematic sequence. */
  elapsed: number
  from?: number
  gap?: number
  opacity?: number
}

/**
 * The five parts of the business, arranged around the bottle as one system.
 *
 * Fine converging lines rather than boxes and arrows: the point is that these
 * are facets of a single thing, not stages in a process diagram.
 */
export function BrandSystem({ elapsed, from = 2.2, gap = 1.0, opacity = 1 }: BrandSystemProps) {
  return (
    <div className="layer layer--atmosphere" style={{ opacity }}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
        {ELEMENTS.map((element, i) => {
          const appear = easeCinematic(clamp((elapsed - (from + i * gap)) / 1.3))
          if (appear <= 0.005) return null
          // The line stops well short of the bottle so nothing crosses it.
          const dx = CENTRE.x - element.x
          const dy = CENTRE.y - element.y
          const length = Math.hypot(dx, dy)
          const stop = 0.62 * appear
          return (
            <g key={element.label} opacity={appear}>
              <line
                x1={element.x + (dx / length) * 26}
                y1={element.y + (dy / length) * 26}
                x2={element.x + dx * stop}
                y2={element.y + dy * stop}
                stroke="var(--stage-accent)"
                strokeWidth="1"
                opacity="0.55"
              />
              <circle cx={element.x} cy={element.y} r="4" fill="var(--stage-accent)" />
              <text
                x={element.x}
                y={element.y - 22}
                textAnchor="middle"
                fill="var(--stage-fg)"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="24"
                fontWeight="600"
                letterSpacing="1.5"
              >
                {element.label}
              </text>
              <text
                x={element.x}
                y={element.y + 34}
                textAnchor="middle"
                fill="var(--stage-fg-soft)"
                fontFamily="'Noto Sans JP', system-ui, sans-serif"
                fontSize="19"
              >
                {element.ja}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
