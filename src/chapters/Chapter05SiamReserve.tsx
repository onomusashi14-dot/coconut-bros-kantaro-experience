import { useCallback } from 'react'
import { Beat, Ja, Statement } from '../components/Typography'
import { ChapterShell } from '../components/ChapterShell'
import { CinematicVideo } from '../components/CinematicVideo'
import { PendingAssetNote } from '../components/PendingAssetNote'
import { useBeat } from '../animation/useBeat'
import { usePresentation } from '../state/presentation'
import { clamp, easeCinematic, inverseLerp } from '../animation/ease'
import { HERO } from '../three/heroTimeline'
import { isAssetPresent } from '../data/assets'
import { markVideoFailed, useVideoHealthy } from '../state/videoHealth'
import { useCueAt } from '../audio/AudioProvider'

const VIDEO_ID = 'vid-bottle-transformation'

/**
 * Chapter 5 — The Hero Transformation and Siam Reserve Reveal.
 *
 * The transformation is a Blender render; the final composition is live WebGL.
 * The clip's last frame and the live camera are matched, and the crossfade sits
 * inside `HERO.handoff`, so the swap has no visible seam. Until the render
 * exists, the WebGL stand-in plays the identical beat map and hands off to the
 * identical frame — nothing about the timing changes when the render lands.
 */
export function Chapter05SiamReserve() {
  const { elapsed } = usePresentation()
  const wordmark = useBeat(20.2, undefined, { enterDuration: 1.6 })
  const closing = useBeat(22.4, undefined, { enterDuration: 1.6 })

  const healthy = useVideoHealthy(VIDEO_ID)
  const hasVideo = isAssetPresent(VIDEO_ID) && healthy
  const onUnavailable = useCallback(() => markVideoFailed(VIDEO_ID), [])

  // Silence before the impact; the water and the glass carry the middle; one
  // minimal note as the label settles; silence again for the hold.
  useCueAt(HERO.impact[0], 'coconut-cut', 0.75)
  useCueAt(HERO.impact[0] + 0.35, 'water-rise', 0.5)
  useCueAt(HERO.formation[1] - 1.6, 'glass-resonance', 0.4)
  useCueAt(HERO.labelReveal[1] - 0.4, 'final-note', 0.42)

  // The rendered clip fades out exactly as the live bottle fades in.
  const handoff = easeCinematic(clamp(inverseLerp(HERO.handoff[0], HERO.handoff[1], elapsed)))
  const modelPending = !isAssetPresent('model-bottle')
  const labelPending = !isAssetPresent('siam-reserve-label')

  return (
    <ChapterShell>
      {hasVideo && (
        <div className="layer layer--media" style={{ opacity: 1 - handoff }}>
          <CinematicVideo assetId={VIDEO_ID} progress={clamp(elapsed / HERO.total)} onUnavailable={onUnavailable} />
        </div>
      )}

      {/* One block, two beats: the wordmark resolves first, the line follows.
          No explanatory body copy ever enters the hero frame. */}
      <Beat from={20.2} placement="bottom-left" scrim="bottom" blockClassName="copy-block--wide">
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(22px, 1.9vw, 34px)',
            fontWeight: 600,
            letterSpacing: '0.42em',
            color: 'var(--stage-accent)',
            opacity: easeCinematic(wordmark.enter),
          }}
        >
          SIAM RESERVE
        </p>
        <div style={{ height: 'clamp(20px, 2.4vh, 38px)' }} />
        <div style={{ opacity: easeCinematic(closing.enter) }}>
          <Statement lines={['THE LEGEND OF THAILAND,', 'RESERVED FOR JAPAN.']} progress={closing.enter} compact />
          <Ja lines={['タイの伝説を、日本へ。']} />
        </div>
      </Beat>

      {(modelPending || labelPending) && (
        <PendingAssetNote
          assetIds={[...(modelPending ? ['model-bottle'] : []), ...(labelPending ? ['siam-reserve-label'] : [])]}
        />
      )}
    </ChapterShell>
  )
}
