import { useEffect, useMemo, useRef } from 'react'
import { usePresentation } from '../state/presentation'
import { useAudio } from '../audio/AudioProvider'
import { useAssetPreloader } from '../hooks/useAssetPreloader'
import { missingRequiredAssets } from '../data/assets'

/**
 * The discreet loading screen and the BEGIN control.
 *
 * The gesture on BEGIN is what legally lets the browser start audio, so nothing
 * begins until the presenter asks for it — with the mouse, Enter or Space.
 */
export function OpeningScreen() {
  const { begin, started } = usePresentation()
  const { unlock } = useAudio()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const chapters = useMemo(() => [1, 2], [])
  const { ready, progress, status } = useAssetPreloader(chapters)
  const missing = useMemo(() => missingRequiredAssets(), [])

  useEffect(() => {
    if (ready) buttonRef.current?.focus()
  }, [ready])

  if (started) return null

  const start = () => {
    void unlock()
    begin()
  }

  return (
    <div className="opening" role="dialog" aria-modal="true" aria-label="Begin the presentation">
      <div className="opening__inner">
        <p className="opening__eyebrow">Coconut Bros</p>
        <h1 className="opening__title">The Nam Hom Legend</h1>
        <p className="opening__ja" lang="ja">
          ナムホームの伝説
        </p>

        <div className="opening__progress" aria-hidden="true">
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="opening__status" role="status">
          {status}
        </p>

        <button ref={buttonRef} className="begin-button" onClick={start} disabled={!ready}>
          Begin
        </button>

        <p className="opening__hint">
          Click, or press Enter or Space. Escape reveals the presenter controls at any time.
        </p>

        {missing.length > 0 && (
          <p className="opening__hint" style={{ maxWidth: '56ch', color: 'rgba(200,150,54,0.75)' }}>
            Prototype build: {missing.length} production {missing.length === 1 ? 'asset is' : 'assets are'} not yet
            supplied and appear as labelled placeholders. Open <code>?debug=assets</code> for the full list.
          </p>
        )}
      </div>
    </div>
  )
}
