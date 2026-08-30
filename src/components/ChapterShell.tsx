import { useLayoutEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { usePresentation, ENTRANCE_MS, EXIT_MS } from '../state/presentation'

/**
 * Every chapter shares the same entrance, exit and marker treatment.
 *
 * The transitions run through GSAP rather than CSS keyframes so their duration
 * stays in one place alongside the state machine's own timings — the animation
 * and the phase it belongs to can never drift apart.
 */
export function ChapterShell({ children }: { children: ReactNode }) {
  const { chapter, phase, reducedMotion } = usePresentation()
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const node = root.current
    if (!node) return
    const context = gsap.context(() => {
      if (reducedMotion) {
        // Reduced motion gets clean cuts: the composition is identical, the
        // movement is not.
        gsap.set(node, { opacity: phase === 'exiting' ? 0 : 1, scale: 1, filter: 'none' })
        return
      }
      if (phase === 'entering') {
        gsap.fromTo(
          node,
          { opacity: 0, scale: 1.028, filter: 'blur(6px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: ENTRANCE_MS / 1000, ease: 'power2.out' },
        )
      } else if (phase === 'exiting') {
        gsap.to(node, {
          opacity: 0,
          scale: 0.988,
          filter: 'blur(4px)',
          duration: EXIT_MS / 1000,
          ease: 'power2.in',
        })
      } else {
        gsap.set(node, { opacity: 1, scale: 1, filter: 'none' })
      }
    }, node)
    return () => context.revert()
  }, [phase, reducedMotion])

  return (
    <section
      ref={root}
      className="chapter"
      data-phase={phase}
      aria-label={`Chapter ${chapter.marker}: ${chapter.title}`}
    >
      {children}
      <p className="chapter-marker">
        <span>{chapter.marker}</span>
        <span aria-hidden="true">/</span>
        <span>{chapter.title}</span>
      </p>
    </section>
  )
}
