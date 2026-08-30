import { Beat, Ja, Statement } from '../components/Typography'
import { ChapterShell } from '../components/ChapterShell'
import { CustomerPath } from '../components/CustomerPath'
import { useBeat } from '../animation/useBeat'
import { usePresentation } from '../state/presentation'
import { clamp, easeCinematic } from '../animation/ease'

const FACTS = [
  'One-product specialisation',
  'Outside ordering and collection',
  'Live cutting as visual theatre',
  'Fast service and impulse conversion',
  'Highly recognisable store identity',
  'Bangkok as the consumer-validation market',
]

const FIRST_FACT = 5.4
const FACT_GAP = 2.1
const FACTS_CLEAR = 18.4

/**
 * Chapter 4 — The Business Model.
 *
 * The flagship is presented as a proving ground: what it specialises in, where
 * the transaction happens, and why Bangkok is the right place to test it. The
 * chapter deliberately ends stripped back to the block and one unopened
 * coconut — the exact frame chapter 5 opens on.
 */
export function Chapter04BusinessModel() {
  const { elapsed } = usePresentation()
  const offer = useBeat(18.8, 21.6)
  const proves = useBeat(21.8, 24.4, { exitDuration: 1.0 })

  // Everything clears for the matched hand-off into the hero reveal.
  const sceneOpacity = 1 - easeCinematic(clamp((elapsed - 22) / 3.4))
  const factsOpacity = easeCinematic(clamp((elapsed - FIRST_FACT + 1) / 1.2)) * (1 - easeCinematic(clamp((elapsed - FACTS_CLEAR) / 1.2)))

  return (
    <ChapterShell>
      <CustomerPath elapsed={elapsed} opacity={sceneOpacity} />
      <div className="scrim scrim--left" style={{ zIndex: 3, opacity: sceneOpacity }} aria-hidden="true" />

      {factsOpacity > 0.01 && (
        <div
          className="type-frame type-frame--center-left"
          style={{ opacity: factsOpacity, paddingTop: 'calc(var(--edge) * 1.6)' }}
        >
          <div className="copy-block">
            <p className="label-line">The flagship, as a business</p>
            <div style={{ height: 20 }} />
            <ul className="fact-list">
              {FACTS.map((fact, i) => {
                const at = FIRST_FACT + i * FACT_GAP
                const appear = easeCinematic(clamp((elapsed - at) / 1.1))
                return (
                  <li
                    className="fact-item"
                    key={fact}
                    style={{ opacity: appear, transform: `translate3d(${(1 - appear) * -14}px,0,0)` }}
                  >
                    <span className="fact-item__bullet" aria-hidden="true" />
                    <span>{fact}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      <Beat from={18.8} to={21.6} placement="bottom-left">
        <div className="price-plate" style={{ opacity: easeCinematic(offer.enter) }}>
          <span className="price-plate__product">Sweet Thai Nam Hom Coconut</span>
          <span className="price-plate__price">79 THB</span>
        </div>
      </Beat>

      <Beat from={21.8} to={24.4} placement="center" scrim="center" exitDuration={1.0}>
        <Statement lines={['BANGKOK PROVES', 'THE BRAND.']} progress={proves.enter} />
        <Ja lines={['バンコクで、ブランドを証明する。']} />
      </Beat>
    </ChapterShell>
  )
}
