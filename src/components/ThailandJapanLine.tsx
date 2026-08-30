import { THAILAND_PATH, JAPAN_MAIN_PATH, JAPAN_SOUTH_PATH, JAPAN_NORTH_PATH } from '../data/geography'
import { clamp } from '../animation/ease'

interface ThailandJapanLineProps {
  /** 0 → 1: leaves the label, draws Thailand, crosses the gap, draws Japan. */
  draw: number
  opacity?: number
}

/** Fraction of the whole draw each segment occupies. */
const SEGMENTS = {
  fromLabel: [0.0, 0.15],
  thailand: [0.13, 0.42],
  crossing: [0.4, 0.62],
  japanMain: [0.6, 0.84],
  japanSouth: [0.82, 0.9],
  japanNorth: [0.88, 1.0],
} as const

const seg = (draw: number, range: readonly [number, number]) =>
  clamp((draw - range[0]) / (range[1] - range[0]))

/**
 * A single fine antique-gold line: it leaves the bottle's label, draws Thailand,
 * crosses open space, and draws Japan. No aircraft, no freight icons, no
 * cartoon logistics — the connection is the whole idea.
 */
export function ThailandJapanLine({ draw, opacity = 1 }: ThailandJapanLineProps) {
  const stroke = 'var(--stage-accent)'
  const line = (progress: number) => ({
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - progress,
  })

  return (
    <div className="layer layer--atmosphere" style={{ opacity }} aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
        <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
          {/* Out of the label, to the right of the bottle */}
          <path d="M 646 560 C 700 540 726 470 742 402 C 750 366 754 336 756 316" style={line(seg(draw, SEGMENTS.fromLabel))} />

          {/* Thailand */}
          <g transform="translate(716, 150) scale(1.06)">
            <path d={THAILAND_PATH} style={line(seg(draw, SEGMENTS.thailand))} strokeWidth="1.7" />
          </g>

          {/* Across the negative space */}
          <path
            d="M 806 258 C 930 186 1046 172 1164 200"
            style={line(seg(draw, SEGMENTS.crossing))}
            strokeWidth="1.3"
          />

          {/* Japan */}
          <g transform="translate(1130, 140) scale(1.25)">
            <path d={JAPAN_MAIN_PATH} style={line(seg(draw, SEGMENTS.japanMain))} strokeWidth="1.7" />
            <path d={JAPAN_SOUTH_PATH} style={line(seg(draw, SEGMENTS.japanSouth))} strokeWidth="1.5" />
            <path d={JAPAN_NORTH_PATH} style={line(seg(draw, SEGMENTS.japanNorth))} strokeWidth="1.6" />
          </g>
        </g>

        <g
          fill="var(--stage-accent)"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="19"
          fontWeight="600"
          letterSpacing="5"
        >
          <text x="700" y="372" opacity={seg(draw, SEGMENTS.thailand)}>
            THAILAND
          </text>
          <text x="1240" y="352" opacity={seg(draw, SEGMENTS.japanMain)}>
            JAPAN
          </text>
        </g>
      </svg>
    </div>
  )
}
