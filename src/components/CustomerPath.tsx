import { clamp, easeInOut, lerp } from '../animation/ease'

const STAGES = ['SEE', 'STOP', 'WATCH', 'DRINK', 'SHARE'] as const

/** Where each stage sits along the pavement, in viewBox units. */
const STAGE_X = [180, 500, 800, 1090, 1400]
const WALK_Y = 640

interface CustomerPathProps {
  /** Seconds into chapter 4's cinematic sequence. */
  elapsed: number
  opacity: number
}

/**
 * The five-stage customer path, played out on the pavement side of the counter.
 *
 * The silhouette never enters the store — the whole model depends on the
 * transaction happening at the window — and the pedestrian flow continues behind
 * it, so the path reads as one continuous move rather than five states.
 */
export function CustomerPath({ elapsed, opacity }: CustomerPathProps) {
  // One continuous walk with a pause at each stage.
  const walkStart = 2.2
  const walkEnd = 15.4
  const raw = clamp((elapsed - walkStart) / (walkEnd - walkStart))
  const segment = raw * (STAGES.length - 1)
  const index = Math.min(Math.floor(segment), STAGES.length - 2)
  const within = segment - index
  // Hold at each stage for the first 45% of its segment, then move decisively.
  const eased = easeInOut(clamp((within - 0.45) / 0.55))
  const x = lerp(STAGE_X[index], STAGE_X[index + 1], eased)
  const bob = Math.sin(eased * Math.PI * 4) * (eased > 0 && eased < 1 ? 5 : 0)

  return (
    <div className="layer" style={{ zIndex: 2, opacity }} aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="cp-counter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b4629" />
            <stop offset="100%" stopColor="#33200f" />
          </linearGradient>
          <radialGradient id="cp-nut" cx="34%" cy="28%">
            <stop offset="0%" stopColor="#dcebae" />
            <stop offset="52%" stopColor="#a9c471" />
            <stop offset="100%" stopColor="#6c8a45" />
          </radialGradient>
        </defs>

        {/* Storefront face and the outside-facing counter */}
        <rect x="0" y="90" width="1600" height="380" fill="#12241a" />
        <rect x="230" y="150" width="1140" height="300" fill="#1b2f21" />
        <rect x="0" y="470" width="1600" height="86" fill="url(#cp-counter)" />
        <rect x="0" y="466" width="1600" height="6" fill="#8a6238" opacity="0.6" />

        {/* Pavement */}
        <rect x="0" y="556" width="1600" height="344" fill="#0a150f" />
        <rect x="0" y="556" width="1600" height="3" fill="#c89636" opacity="0.22" />

        {/* The cutting board stays at the centre of the frame throughout */}
        <g>
          <rect x="700" y="430" width="200" height="42" rx="3" fill="#432a1c" />
          <rect x="700" y="426" width="200" height="6" fill="#8a6238" opacity="0.7" />
          <circle cx="800" cy="418" r="26" fill="url(#cp-nut)" />
        </g>

        {/* Natural pedestrian flow continuing past the store */}
        {[0, 1, 2].map((i) => {
          const drift = ((elapsed * (14 + i * 5) + i * 620) % 1900) - 150
          return (
            <g key={i} opacity={0.22} transform={`translate(${drift}, ${WALK_Y + i * 14})`}>
              <circle cx="0" cy="-108" r="20" fill="#f4efe4" />
              <path d="M -22 -88 Q 0 -76 22 -88 L 18 0 L -18 0 Z" fill="#f4efe4" />
            </g>
          )
        })}

        {/* Stage markers along the pavement */}
        {STAGES.map((stage, i) => {
          const reached = clamp((segment - (i - 0.35)) / 0.6)
          return (
            <g key={stage} opacity={reached}>
              <circle cx={STAGE_X[i]} cy={WALK_Y + 96} r="5" fill="#c89636" />
              <text
                x={STAGE_X[i]}
                y={WALK_Y + 140}
                textAnchor="middle"
                fill="#f4efe4"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="30"
                fontWeight="600"
                letterSpacing="6"
              >
                {stage}
              </text>
            </g>
          )
        })}
        <line
          x1={STAGE_X[0]}
          y1={WALK_Y + 96}
          x2={lerp(STAGE_X[0], STAGE_X[STAGE_X.length - 1], raw)}
          y2={WALK_Y + 96}
          stroke="#c89636"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* The customer */}
        <g transform={`translate(${x}, ${WALK_Y + bob})`} opacity={clamp((elapsed - walkStart + 1.2) / 1.2)}>
          <circle cx="0" cy="-116" r="24" fill="#f4efe4" />
          <path d="M -28 -92 Q 0 -78 28 -92 L 22 6 L -22 6 Z" fill="#f4efe4" />
        </g>
      </svg>
    </div>
  )
}
