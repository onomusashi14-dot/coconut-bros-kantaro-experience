import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { anyVideoFailed, resetVideo } from '../state/videoHealth'
import { usePresentation } from '../state/presentation'

const VIDEO_IDS = ['vid-bottle-transformation', 'vid-discovery', 'vid-provenance', 'vid-bangkok', 'vid-business-ritual', 'vid-japan-transition']

/**
 * A discreet recovery affordance.
 *
 * If a cinematic clip fails to decode the chapter has already fallen back to its
 * WebGL rendering, so nothing is broken on screen — this only offers the
 * presenter a way to retry the clip without reloading the page.
 */
export function RecoveryNotice() {
  const { replay } = usePresentation()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setFailed(anyVideoFailed()), 1500)
    return () => window.clearInterval(id)
  }, [])

  if (!failed) return null

  return (
    <button
      className="recovery"
      onClick={() => {
        VIDEO_IDS.forEach(resetVideo)
        setFailed(false)
        replay()
      }}
    >
      <RefreshCw size={15} aria-hidden="true" />
      Cinematic clip did not decode — running the live rendering. Retry?
    </button>
  )
}
