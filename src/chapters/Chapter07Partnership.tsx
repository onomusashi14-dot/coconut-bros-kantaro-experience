import { Ja, Statement } from '../components/Typography'
import { ChapterShell } from '../components/ChapterShell'
import { BrandSystem } from '../components/BrandSystem'
import { AssetImage } from '../components/Placeholder'
import { PendingAssetNote } from '../components/PendingAssetNote'
import { useBeat } from '../animation/useBeat'
import { usePresentation } from '../state/presentation'
import { clamp, easeCinematic } from '../animation/ease'
import { isAssetPresent } from '../data/assets'
import { useCueAt } from '../audio/AudioProvider'

const ROLES = [
  { key: 'AUTHORSHIP', body: 'Shape how the Nam Hom story is introduced in Japan.' },
  { key: 'JUDGMENT', body: 'Choose the right positioning, collaborations and market sequence.' },
  { key: 'GUARDIANSHIP', body: 'Protect provenance, quality and cultural respect.' },
  { key: 'RECOGNITION', body: 'Remain visibly associated with the Japanese chapter from its beginning.' },
  { key: 'DISCIPLINE', body: 'Approve expansion only when evidence supports it.' },
]

const SYSTEM_FROM = 2.2
const SYSTEM_CLEAR = 8.0
const TITLE_AT = 9.4
const TITLE_CLEAR = 13.8
const FIRST_ROLE = 14.2
const ROLE_GAP = 2.2
const ROLES_CLEAR = 25.4
const FINAL_AT = 26.2

/**
 * Chapter 7 — The Founding Partnership.
 *
 * The Japanese role is framed as authorship and guardianship rather than
 * financing. Each element of the frame gets it to itself: the system resolves
 * and clears, the title lands, the five dimensions arrive one at a time, and the
 * closing frame puts the Bangkok store beside the bottle. Then everything stops.
 */
export function Chapter07Partnership() {
  const { elapsed } = usePresentation()
  const title = useBeat(TITLE_AT, TITLE_CLEAR)
  const closing = useBeat(FINAL_AT)

  useCueAt(FINAL_AT + 0.8, 'final-note', 0.34)

  const systemOpacity = 1 - easeCinematic(clamp((elapsed - SYSTEM_CLEAR) / 1.5))
  const rolesOpacity =
    easeCinematic(clamp((elapsed - FIRST_ROLE + 1) / 1.2)) * (1 - easeCinematic(clamp((elapsed - ROLES_CLEAR) / 1.4)))
  const finalOpacity = easeCinematic(clamp((elapsed - FINAL_AT) / 1.8))

  const modelPending = !isAssetPresent('model-bottle')

  return (
    <ChapterShell>
      {systemOpacity > 0.01 && <BrandSystem elapsed={elapsed} from={SYSTEM_FROM} opacity={systemOpacity} />}

      {title.active && (
        <div
          className="type-frame"
          style={{
            alignItems: 'flex-end',
            justifyContent: 'center',
            textAlign: 'center',
            opacity: title.opacity,
          }}
        >
          <div className="copy-block copy-block--center">
            <Statement lines={['FOUNDING JAPAN PARTNER']} progress={title.enter} compact />
            <Ja lines={['日本市場 創設パートナー']} />
          </div>
        </div>
      )}

      {rolesOpacity > 0.01 && (
        <div className="type-frame" style={{ alignItems: 'center', justifyContent: 'flex-end', opacity: rolesOpacity }}>
          <div style={{ display: 'grid', gap: 'clamp(14px, 1.6vh, 26px)' }}>
            {ROLES.map((role, i) => {
              const appear = easeCinematic(clamp((elapsed - (FIRST_ROLE + i * ROLE_GAP)) / 1.2))
              return (
                <div
                  className="role-block"
                  key={role.key}
                  style={{ opacity: appear, transform: `translate3d(${(1 - appear) * 18}px, 0, 0)` }}
                >
                  <span className="role-block__key">{role.key}</span>
                  <span className="role-block__body">{role.body}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Two expressions of one brand: the Bangkok store, and the bottle the
          camera has pulled back to reveal on the right. One flow column, so the
          panel and the closing copy cannot collide on a shorter 16:9 screen. */}
      {finalOpacity > 0.01 && (
        <div className="type-frame type-frame--bottom-left" style={{ opacity: finalOpacity }}>
          <div
            className="copy-block"
            style={{ maxWidth: 'min(46ch, 50vw)', display: 'grid', gap: 'clamp(14px, 2.2vh, 28px)' }}
          >
            <div style={{ width: 'min(28vw, 400px)' }}>
              <AssetImage
                assetId="img-store"
                alt="The Coconut Bros Bangkok flagship storefront."
                ratio="16 / 9"
                compact
              />
              <p className="label-line" style={{ marginTop: 12 }}>
                Bangkok flagship · the ritual
              </p>
            </div>

            <div>
              <Statement
                lines={['BUILD THE LEGEND IN BANGKOK.', 'CARRY IT TO JAPAN.']}
                progress={closing.enter}
                compact
              />
              <Ja lines={['バンコクで伝説を築き、日本へ届ける。']} />
            </div>

            <div>
              <p className="label-line">Proposed next step</p>
              <p className="support-line" style={{ marginTop: 8 }}>
                Joint feasibility and product-validation phase.
              </p>
            </div>
          </div>
        </div>
      )}

      {modelPending && <PendingAssetNote assetIds={['model-bottle']} />}
    </ChapterShell>
  )
}
