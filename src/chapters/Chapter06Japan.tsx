import { Ja, Statement } from '../components/Typography'
import { ChapterShell } from '../components/ChapterShell'
import { ThailandJapanLine } from '../components/ThailandJapanLine'
import { PendingAssetNote } from '../components/PendingAssetNote'
import { useBeat } from '../animation/useBeat'
import { usePresentation } from '../state/presentation'
import { clamp, easeCinematic } from '../animation/ease'
import { isAssetPresent } from '../data/assets'

const POINTS = [
  'Premium Nam Hom coconut water',
  'Authentic Thai provenance',
  'Distinctive glass packaging',
  'A real Bangkok origin story',
  'Selective Japanese market entry',
]

const PATHWAY = [
  'Verify processing and shelf life',
  'Validate packaging and Japanese compliance',
  'Test selective hospitality and retail channels',
  'Build recognition before mass distribution',
]

const FIRST_POINT = 13.2
const POINT_GAP = 1.4
const POINTS_CLEAR = 20.2
const PATHWAY_AT = 21.0

/**
 * Chapter 6 — The Japan Vision.
 *
 * The bottle does not change; the world around it does. The validation pathway
 * is stated as a proposal — none of these four steps is claimed as complete.
 */
export function Chapter06Japan() {
  const { elapsed } = usePresentation()
  const creates = useBeat(2.0, 7.4)
  const carries = useBeat(7.6, 12.8)

  const draw = clamp((elapsed - 3.0) / 12.5)
  const pointsOpacity =
    easeCinematic(clamp((elapsed - FIRST_POINT + 1) / 1.2)) * (1 - easeCinematic(clamp((elapsed - POINTS_CLEAR) / 1.2)))
  const pathwayOpacity = easeCinematic(clamp((elapsed - PATHWAY_AT) / 1.6))

  const modelPending = !isAssetPresent('model-bottle')
  const labelPending = !isAssetPresent('siam-reserve-label')

  return (
    <ChapterShell>
      <ThailandJapanLine draw={draw} />

      {/* Statements sit low and right of the bottle, clear of the line. */}
      {creates.active && (
        <div
          className="type-frame"
          style={{
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            opacity: creates.opacity,
            paddingBottom: 'calc(var(--edge) * 1.1)',
          }}
        >
          <div className="copy-block" style={{ maxWidth: 'min(30ch, 44vw)' }}>
            <Statement lines={['BANGKOK CREATES', 'THE LEGEND.']} progress={creates.enter} />
          </div>
        </div>
      )}

      {carries.active && (
        <div
          className="type-frame"
          style={{
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            opacity: carries.opacity,
            paddingBottom: 'calc(var(--edge) * 1.1)',
          }}
        >
          <div className="copy-block" style={{ maxWidth: 'min(32ch, 46vw)' }}>
            <Statement lines={['SIAM RESERVE', 'CARRIES IT TO JAPAN.']} progress={carries.enter} />
            <Ja lines={['バンコクで生まれた伝説を、', 'サイアム・リザーブが日本へ。']} />
          </div>
        </div>
      )}

      {pointsOpacity > 0.01 && (
        <div
          className="type-frame"
          style={{
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            opacity: pointsOpacity,
            paddingBottom: 'calc(var(--edge) * 1.1)',
          }}
        >
          <ul className="fact-list" style={{ maxWidth: 'min(34ch, 46vw)' }}>
            {POINTS.map((point, i) => {
              const appear = easeCinematic(clamp((elapsed - (FIRST_POINT + i * POINT_GAP)) / 1.1))
              return (
                <li className="fact-item" key={point} style={{ opacity: appear, transform: `translate3d(0, ${(1 - appear) * 12}px, 0)` }}>
                  <span className="fact-item__bullet" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {pathwayOpacity > 0.01 && (
        <div
          className="type-frame"
          style={{
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            opacity: pathwayOpacity,
            paddingBottom: 'calc(var(--edge) * 1.1)',
          }}
        >
          <div className="copy-block" style={{ maxWidth: 'min(38ch, 48vw)' }}>
            <p className="label-line">Proposed validation pathway — not yet undertaken</p>
            <div style={{ height: 22 }} />
            <ol className="steps">
              {PATHWAY.map((step, i) => {
                const appear = easeCinematic(clamp((elapsed - (PATHWAY_AT + 0.6 + i * 0.7)) / 1.0))
                return (
                  <li key={step} style={{ opacity: appear }}>
                    <span>{step}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}

      {(modelPending || labelPending) && (
        <PendingAssetNote
          assetIds={[...(modelPending ? ['model-bottle'] : []), ...(labelPending ? ['siam-reserve-label'] : [])]}
          side="left"
        />
      )}
    </ChapterShell>
  )
}
