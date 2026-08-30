import { usePresentation } from '../state/presentation'
import { StageCanvas } from '../three/StageCanvas'
import { Chapter01Discovery } from '../chapters/Chapter01Discovery'
import { Chapter02Provenance } from '../chapters/Chapter02Provenance'
import { Chapter03Bangkok } from '../chapters/Chapter03Bangkok'
import { Chapter04BusinessModel } from '../chapters/Chapter04BusinessModel'
import { Chapter05SiamReserve } from '../chapters/Chapter05SiamReserve'
import { Chapter06Japan } from '../chapters/Chapter06Japan'
import { Chapter07Partnership } from '../chapters/Chapter07Partnership'
import { RecoveryNotice } from './RecoveryNotice'

const CHAPTER_COMPONENTS = [
  Chapter01Discovery,
  Chapter02Provenance,
  Chapter03Bangkok,
  Chapter04BusinessModel,
  Chapter05SiamReserve,
  Chapter06Japan,
  Chapter07Partnership,
]

/**
 * The persistent full-viewport stage.
 *
 * Layers, back to front: poster fallback, chapter media, the WebGL canvas, the
 * atmospheric layer, typography, presenter controls. Only one chapter is mounted
 * at a time, so nothing off-screen keeps animating or holding memory.
 */
export function Stage() {
  const { chapter, chapterIndex, started } = usePresentation()
  const Active = CHAPTER_COMPONENTS[chapterIndex] ?? CHAPTER_COMPONENTS[0]

  return (
    <div className="stage" data-palette={chapter.palette}>
      <div className="layer layer--poster" aria-hidden="true" />
      <StageCanvas />
      {started && <Active key={chapter.slug} />}
      <RecoveryNotice />
    </div>
  )
}
