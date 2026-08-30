import { useMemo } from 'react'
import { clamp, easeCinematic, easeImpact, lerp } from '../animation/ease'
import { BrandMark } from './Placeholder'

interface BangkokCounterProps {
  /** Seconds into chapter 3's cinematic sequence. */
  elapsed: number
  /** Fades out as the photographed storefront takes over. */
  opacity: number
}

const ramp = (elapsed: number, from: number, to: number) => easeCinematic(clamp((elapsed - from) / (to - from)))

/**
 * The Bangkok flagship, assembled on screen.
 *
 * This is a constructed diagram of the real store — timber, two shelves, the
 * outside cutting counter, ice — drawn so the assembly can be animated beat by
 * beat. It is deliberately schematic: `assets/images/bangkok-store.jpg` is the
 * photograph, and it takes over the frame for the reveal. Nothing here is used
 * as, or in place of, the Coconut Bros logo.
 */
export function BangkokCounter({ elapsed, opacity }: BangkokCounterProps) {
  const land = easeImpact(clamp(elapsed / 1.1))
  const slab = ramp(elapsed, 1.1, 3.4)
  const timber = ramp(elapsed, 3.4, 6.0)
  const shelves = ramp(elapsed, 6.0, 9.2)
  const ice = ramp(elapsed, 9.0, 11.2)
  const leaves = ramp(elapsed, 11.0, 12.8)
  const flag = ramp(elapsed, 12.6, 14.2)
  const sign = ramp(elapsed, 14.0, 16.4)

  const shelfCoconuts = useMemo(() => Array.from({ length: 13 }, (_, i) => i), [])
  const iceCoconuts = useMemo(() => Array.from({ length: 5 }, (_, i) => i), [])

  return (
    <div className="layer" style={{ zIndex: 2, opacity }} aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="cb-timber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a3a25" />
            <stop offset="100%" stopColor="#33200f" />
          </linearGradient>
          <linearGradient id="cb-slab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b4629" />
            <stop offset="100%" stopColor="#3d2415" />
          </linearGradient>
          <radialGradient id="cb-nut" cx="34%" cy="28%">
            <stop offset="0%" stopColor="#dcebae" />
            <stop offset="52%" stopColor="#a9c471" />
            <stop offset="100%" stopColor="#6c8a45" />
          </radialGradient>
          <radialGradient id="cb-open" cx="42%" cy="34%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#eef3dd" />
            <stop offset="100%" stopColor="#c6d69a" />
          </radialGradient>
          <clipPath id="cb-timber-clip">
            <rect x="240" y="110" width="1120" height="430" />
          </clipPath>
        </defs>

        {/* Back timber wall */}
        <g opacity={timber} clipPath="url(#cb-timber-clip)">
          <rect x="240" y={110 + (1 - timber) * 60} width="1120" height="430" fill="url(#cb-timber)" />
          {Array.from({ length: 15 }, (_, i) => (
            <rect key={i} x={240 + i * 74.6} y="110" width="2.5" height="430" fill="#20120a" opacity="0.55" />
          ))}

          {/* Rugged Thai-flag treatment across the timber: restrained, worn, and
              never covering the signage. */}
          <g opacity={flag * 0.17}>
            <rect x="240" y="112" width="1120" height="44" fill="#a63832" />
            <rect x="240" y="156" width="1120" height="24" fill="#f4efe4" />
            <rect x="240" y="180" width="1120" height="58" fill="#233b67" />
            <rect x="240" y="238" width="1120" height="24" fill="#f4efe4" />
            <rect x="240" y="262" width="1120" height="44" fill="#a63832" />
            {Array.from({ length: 15 }, (_, i) => (
              <rect key={i} x={240 + i * 74.6} y="110" width="7" height="430" fill="#20120a" opacity="0.9" />
            ))}
          </g>
        </g>

        {/* Two long shelves of whole coconuts */}
        <g opacity={shelves}>
          {[352, 452].map((y, row) => (
            <g key={y}>
              <rect x="300" y={y + 42} width="1000" height="14" fill="#4a2f1d" />
              {shelfCoconuts.map((i) => {
                // Scaled so the last coconut on the lower shelf is fully in place
                // by the time the shelf beat completes.
                const appear = clamp((shelves * 24 - (row * 6 + i * 0.9)) / 3)
                return (
                  <circle
                    key={i}
                    cx={330 + i * 78}
                    cy={y + 12 + (1 - appear) * -30}
                    r={30 * appear}
                    fill="url(#cb-nut)"
                    opacity={appear}
                  />
                )
              })}
            </g>
          ))}
        </g>

        {/* Signage plate. The logo itself is an HTML layer above this SVG so a
            missing brand file shows as a labelled slot, never as invented art. */}
        <g opacity={sign}>
          <rect x="520" y={150 + (1 - sign) * 24} width="560" height="140" rx="4" fill="#0f3b28" opacity={sign * 0.94} />
          <rect
            x="520"
            y={150 + (1 - sign) * 24}
            width={560 * sign}
            height="140"
            rx="4"
            fill="none"
            stroke="#c89636"
            strokeWidth="2"
          />
        </g>

        {/* Outside cutting counter */}
        <g opacity={slab}>
          <rect
            x={800 - 560 * slab}
            y="560"
            width={1120 * slab}
            height="76"
            fill="url(#cb-slab)"
          />
          <rect x={800 - 560 * slab} y="636" width={1120 * slab} height="150" fill="#2b1a0e" />
          <rect x={800 - 560 * slab} y="556" width={1120 * slab} height="6" fill="#8a6238" opacity="0.7" />
        </g>

        {/* Opened coconuts settling onto ice */}
        <g opacity={ice}>
          <rect x="300" y="574" width="420" height="52" rx="6" fill="#cfe3ea" opacity={ice * 0.55} />
          {iceCoconuts.map((i) => {
            const appear = clamp((ice * 6 - i) / 2)
            return (
              <g key={i} opacity={appear}>
                <circle cx={356 + i * 82} cy={588 - (1 - appear) * 26} r={30} fill="url(#cb-nut)" />
                <ellipse cx={356 + i * 82} cy={572 - (1 - appear) * 26} rx={19} ry={9} fill="url(#cb-open)" />
              </g>
            )
          })}
        </g>

        {/* The coconut that lands on the wood and starts the whole build */}
        <circle cx="800" cy={lerp(-120, 546, land)} r="34" fill="url(#cb-nut)" opacity={1 - clamp((elapsed - 3.6) / 1.6)} />

        {/* Tropical leaves moving into the edges of the frame */}
        <g opacity={leaves}>
          <path
            d={`M ${-120 + leaves * 180} 40 Q 240 200 60 470 Q 30 250 ${-120 + leaves * 180} 40 Z`}
            fill="#0c2f1e"
          />
          <path
            d={`M ${1720 - leaves * 200} 0 Q 1380 190 1560 500 Q 1620 240 ${1720 - leaves * 200} 0 Z`}
            fill="#0a2818"
          />
          <path d={`M ${-80 + leaves * 120} 900 Q 300 780 420 900 Z`} fill="#0c2f1e" opacity="0.9" />
        </g>
      </svg>

      {/* Brand slot, positioned over the signage plate. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          // Aligned to the centre of the signage plate in the SVG above (y 150–290
          // of a 900-unit viewBox), which holds at both 16:10 and 16:9.
          top: '24.4%',
          transform: `translate(-50%, -50%) scale(${lerp(0.94, 1, sign)})`,
          opacity: sign,
          display: 'grid',
          placeItems: 'center',
          width: 'min(520px, 34vw)',
        }}
      >
        <BrandMark height={96} />
      </div>
    </div>
  )
}
