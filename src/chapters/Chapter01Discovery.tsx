import { Beat, Hero, Ja, Statement, Support } from '../components/Typography'
import { ChapterShell } from '../components/ChapterShell'
import { useBeat } from '../animation/useBeat'
import { useCueAt } from '../audio/AudioProvider'

/**
 * Chapter 1 — The Discovery.
 *
 * Opens in complete blackness. A single condensation droplet forms; the camera
 * pushes through it into the grove. The point to land is definitional: Nam Hom
 * is a specific Thai coconut, not a word for coconut water.
 */
export function Chapter01Discovery() {
  const primary = useBeat(3.6, 9.0)
  const definition = useBeat(9.6)

  useCueAt(0.9, 'droplet', 0.5)

  return (
    <ChapterShell>
      <Beat from={3.6} to={9.0} placement="center" scrim="center">
        <Hero lines={['NOT ALL COCONUTS', 'ARE NAM HOM.']} progress={primary.enter} />
        <Ja lines={['すべてのココナッツが、ナムホームではない。']} />
      </Beat>

      <Beat from={9.6} placement="bottom-left" scrim="bottom">
        <Statement lines={['Thailand’s aromatic', 'young coconut.']} progress={definition.enter} />
        <Ja lines={['タイが誇る、香り高い若いココナッツ。']} />
        <div style={{ height: 22 }} />
        <Support>
          Nam Hom is a named varietal, grown in a handful of Thai provinces and picked young for its perfume.
        </Support>
      </Beat>
    </ChapterShell>
  )
}
