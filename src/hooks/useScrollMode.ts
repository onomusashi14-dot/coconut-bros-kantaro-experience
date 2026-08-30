import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePresentation, CHAPTERS, CHAPTER_COUNT } from '../state/presentation'

gsap.registerPlugin(ScrollTrigger)

/**
 * Development and testing only, behind `?mode=scroll`.
 *
 * The final presentation is keyboard driven and must never depend on scroll
 * position; this exists so a chapter's timing can be scrubbed by hand while it
 * is being built.
 */
export function useScrollMode(enabled: boolean) {
  const { jumpTo, seek, begin, started } = usePresentation()

  useEffect(() => {
    if (!enabled) return
    if (!started) begin()
  }, [enabled, started, begin])

  useEffect(() => {
    if (!enabled) return
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const global = self.progress * CHAPTER_COUNT
        const index = Math.min(Math.floor(global), CHAPTER_COUNT - 1)
        jumpTo(index)
        seek((global - index) * CHAPTERS[index].duration)
      },
    })
    // The track mounts in the same commit, so measure once the layout settles.
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => {
      window.clearTimeout(refresh)
      trigger.kill()
    }
  }, [enabled, jumpTo, seek])
}
