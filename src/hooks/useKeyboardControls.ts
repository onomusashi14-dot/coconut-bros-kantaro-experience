import { useEffect } from 'react'
import { usePresentation, CHAPTER_COUNT } from '../state/presentation'

/**
 * The presenter's entire control surface. Nothing here is visible during the
 * presentation; the Escape overlay is the only affordance, and it is opt-in.
 */
export function useKeyboardControls() {
  const {
    started,
    begin,
    next,
    prev,
    goTo,
    togglePlay,
    toggleMute,
    toggleOverlay,
    toggleFullscreen,
    overlay,
    setOverlay,
  } = usePresentation()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Never steal keys from a focused text field.
      const node = event.target as HTMLElement | null
      if (node && (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.isContentEditable)) return

      if (!started) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault()
          begin()
        }
        return
      }

      switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
          event.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault()
          prev()
          break
        case ' ':
        case 'Spacebar':
          event.preventDefault()
          togglePlay()
          break
        case 'f':
        case 'F':
          event.preventDefault()
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          event.preventDefault()
          toggleMute()
          break
        case 'Escape':
          event.preventDefault()
          toggleOverlay()
          break
        default:
          if (/^[1-7]$/.test(event.key)) {
            const requested = Number(event.key)
            if (requested <= CHAPTER_COUNT) {
              event.preventDefault()
              goTo(requested - 1)
              if (overlay) setOverlay(false)
            }
          }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, begin, next, prev, goTo, togglePlay, toggleMute, toggleOverlay, toggleFullscreen, overlay, setOverlay])
}
