import { useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { CHAPTERS, usePresentation } from '../state/presentation'
import { missingRequiredAssets } from '../data/assets'

const KEYS: [string, string][] = [
  ['→ / PgDn', 'Next chapter'],
  ['← / PgUp', 'Previous chapter'],
  ['Space', 'Play / pause · replay a settled chapter'],
  ['1 – 7', 'Jump to a chapter'],
  ['F', 'Fullscreen'],
  ['M', 'Mute'],
  ['Esc', 'Show or hide this panel'],
]

/**
 * The only visible control surface, and it is opt-in.
 *
 * Nothing here appears during the presentation itself; Escape brings it up
 * between chapters, and Escape puts it away again.
 */
export function PresenterOverlay() {
  const {
    overlay,
    setOverlay,
    chapterIndex,
    chapter,
    goTo,
    next,
    prev,
    playing,
    togglePlay,
    replay,
    muted,
    toggleMute,
    toggleFullscreen,
    phase,
    reducedMotion,
  } = usePresentation()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (overlay) panelRef.current?.focus()
  }, [overlay])

  useEffect(() => {
    document.body.dataset.pointer = overlay ? 'visible' : 'hidden'
  }, [overlay])

  if (!overlay) return null
  const missing = missingRequiredAssets()

  return (
    <div className="presenter" role="dialog" aria-modal="false" aria-label="Presenter controls">
      <div className="presenter__panel" ref={panelRef} tabIndex={-1}>
        <div className="presenter__row" style={{ justifyContent: 'space-between' }}>
          <h2 className="presenter__title">
            Presenter controls — {chapter.marker} {chapter.title} ({phase})
          </h2>
          <button className="presenter__button" onClick={() => setOverlay(false)}>
            <X size={16} aria-hidden="true" /> Close
          </button>
        </div>

        <p className="presenter__note">{chapter.presenterNote}</p>

        <div className="presenter__grid">
          {CHAPTERS.map((entry, index) => (
            <button
              key={entry.slug}
              className="presenter__chapter"
              aria-current={index === chapterIndex}
              onClick={() => {
                goTo(index)
                setOverlay(false)
              }}
            >
              <b>
                {entry.marker} · {entry.title}
              </b>
              <small>{entry.presenterNote}</small>
            </button>
          ))}
        </div>

        <div className="presenter__row">
          <button className="presenter__button" onClick={prev}>
            <ChevronLeft size={16} aria-hidden="true" /> Back
          </button>
          <button className="presenter__button" onClick={next}>
            Forward <ChevronRight size={16} aria-hidden="true" />
          </button>
          <button className="presenter__button" onClick={togglePlay}>
            {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {playing ? 'Pause' : 'Play'}
          </button>
          <button className="presenter__button" onClick={replay}>
            <RotateCcw size={16} aria-hidden="true" /> Replay chapter
          </button>
          <button className="presenter__button" onClick={toggleMute}>
            {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <button className="presenter__button" onClick={toggleFullscreen}>
            <Maximize2 size={16} aria-hidden="true" /> Fullscreen
          </button>
        </div>

        <div className="presenter__keys">
          {KEYS.map(([key, description]) => (
            <div key={key}>
              <kbd>{key}</kbd>
              <span>{description}</span>
            </div>
          ))}
        </div>

        {reducedMotion && (
          <p className="presenter__warn">
            The system is set to reduced motion. Cinematic sequences are replaced by clean cuts and still
            compositions; the full narrative is preserved.
          </p>
        )}

        {missing.length > 0 && (
          <p className="presenter__warn">
            {missing.length} production {missing.length === 1 ? 'asset is' : 'assets are'} still outstanding and are
            shown as labelled placeholders — including{' '}
            {missing
              .slice(0, 3)
              .map((asset) => asset.path)
              .join(', ')}
            {missing.length > 3 ? ` and ${missing.length - 3} more` : ''}. Append <code>?debug=assets</code> to the URL
            for the full manifest.
          </p>
        )}
      </div>
    </div>
  )
}
