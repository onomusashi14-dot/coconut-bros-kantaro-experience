import type { CSSProperties } from 'react'
import { Beat, Ja, Statement, Support } from '../components/Typography'
import { ChapterShell } from '../components/ChapterShell'
import { AssetImage } from '../components/Placeholder'
import { useBeat } from '../animation/useBeat'
import { usePresentation } from '../state/presentation'
import { clamp, easeCinematic, easeInOut, lerp } from '../animation/ease'
import { useCueAt } from '../audio/AudioProvider'

const SCENES = [
  { assetId: 'img-grove', alt: 'Nam Hom coconuts growing high on the palm.', from: 0.6, to: 7.2 },
  { assetId: 'img-harvest', alt: 'A harvester cutting a bunch free with a long pole.', from: 6.6, to: 13.2 },
  { assetId: 'img-selection', alt: 'Coconuts being trimmed, sorted and packed into ice.', from: 12.6, to: 18.4 },
]

/**
 * Chapter 2 — The Provenance.
 *
 * The three scenes are tied together by one continuous element travelling across
 * them, so the sequence reads as a single move through the supply chain rather
 * than as three separate slides.
 */
export function Chapter02Provenance() {
  const { elapsed } = usePresentation()
  const grown = useBeat(1.4, 6.8)
  const picked = useBeat(7.4, 12.8)
  const selected = useBeat(13.4, 17.6)
  const closing = useBeat(18.2)

  useCueAt(7.6, 'coconut-cut', 0.4)

  // One coconut travels the full width across all three scenes.
  const travel = easeInOut(clamp((elapsed - 0.8) / 16.4))

  return (
    <ChapterShell>
      <div className="layer" style={{ zIndex: 2, overflow: 'hidden' }} aria-hidden={false}>
        {SCENES.map((scene, i) => {
          const local = clamp((elapsed - scene.from) / 1.2)
          const out = clamp((elapsed - scene.to) / 1.2)
          const opacity = easeCinematic(local) * (1 - easeCinematic(out))
          if (opacity <= 0.002) return null
          // A slow push keeps each still frame alive without turning it into a
          // moving background behind body copy.
          const scale = lerp(1.06, 1.13, clamp((elapsed - scene.from) / 8))
          const style: CSSProperties = {
            position: 'absolute',
            inset: 0,
            opacity,
            transform: `scale(${scale}) translate3d(${(i - 1) * 1.2}%, 0, 0)`,
            display: 'grid',
            placeItems: 'center',
            padding: '6vh 6vw',
          }
          return (
            <div key={scene.assetId} style={style}>
              <AssetImage assetId={scene.assetId} alt={scene.alt} ratio="16 / 9" style={{ maxHeight: '88vh' }} />
            </div>
          )
        })}
        <div className="scrim scrim--bottom" />
      </div>

      {/* The continuous element: one coconut crossing the frame for the whole chapter. */}
      <div
        className="layer layer--atmosphere"
        style={{
          transform: `translate3d(${lerp(-8, 108, travel)}vw, ${Math.sin(travel * Math.PI) * -6}vh, 0)`,
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            top: '58%',
            width: 'clamp(64px, 6vw, 108px)',
            aspectRatio: '1 / 1.1',
            borderRadius: '46% 46% 44% 44% / 42% 42% 58% 58%',
            background: 'radial-gradient(38% 34% at 36% 28%, #d7e6a4 0%, #a9c471 46%, #6f8c47 100%)',
            boxShadow: '0 18px 46px rgba(0,0,0,0.5)',
            opacity: 0.92,
            transform: `rotate(${travel * 220}deg)`,
          }}
        />
      </div>

      <Beat from={1.4} to={6.8} placement="bottom-left">
        <Statement lines={['GROWN FOR AROMA.']} progress={grown.enter} />
        <Ja lines={['香りのために育てる。']} />
      </Beat>

      <Beat from={7.4} to={12.8} placement="bottom-left">
        <Statement lines={['PICKED FOR SWEETNESS.']} progress={picked.enter} />
        <Ja lines={['甘さを見極めて収穫する。']} />
      </Beat>

      <Beat from={13.4} to={17.6} placement="bottom-left">
        <Statement lines={['SELECTED FOR FRESHNESS.']} progress={selected.enter} />
        <Ja lines={['鮮度のために選び抜く。']} />
      </Beat>

      <Beat from={18.2} placement="bottom-left" scrim="bottom" blockClassName="copy-block--wide">
        <div className="pathline" style={{ opacity: easeCinematic(closing.enter) }}>
          {['GROW', 'HARVEST', 'SELECT', 'PROTECT'].map((step, i) => (
            <span className="pathline__step" key={step}>
              {i > 0 && <span className="pathline__arrow">→</span>}
              {step}
            </span>
          ))}
        </div>
        <div style={{ height: 26 }} />
        <Support>Provenance is not decoration. It determines what reaches the bottle.</Support>
      </Beat>
    </ChapterShell>
  )
}
