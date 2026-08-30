import { usePresentation } from '../state/presentation'
import { clamp, easeCinematic } from './ease'

export interface BeatState {
  /** The beat currently owns the frame. */
  active: boolean
  /** 0 → 1 as the beat enters. */
  enter: number
  /** 0 → 1 as the beat leaves. Stays 0 for persistent beats. */
  exit: number
  /** Composite opacity, already eased. */
  opacity: number
  /** 0 → 1 across the beat's own span, for internal sub-animation. */
  local: number
}

export interface BeatOptions {
  /** Seconds the beat takes to enter. */
  enterDuration?: number
  /** Seconds the beat takes to leave. */
  exitDuration?: number
}

/**
 * Derives a beat's state from the chapter clock.
 *
 * `from` is when the beat starts entering; `to` is when it starts leaving.
 * Omitting `to` makes the beat part of the chapter's hold composition — it stays
 * on screen indefinitely once the sequence settles.
 */
export function useBeat(from: number, to?: number, options: BeatOptions = {}): BeatState {
  const { elapsed, reducedMotion, phase } = usePresentation()
  const enterDuration = options.enterDuration ?? 1.1
  const exitDuration = options.exitDuration ?? 0.8

  // Reduced motion replaces every reveal with a clean cut.
  if (reducedMotion) {
    const settled = phase === 'holding'
    const visible = settled ? to === undefined : elapsed >= from && (to === undefined || elapsed < to)
    return { active: visible, enter: visible ? 1 : 0, exit: visible ? 0 : 1, opacity: visible ? 1 : 0, local: 1 }
  }

  const enter = clamp((elapsed - from) / enterDuration)
  const exit = to === undefined ? 0 : clamp((elapsed - to) / exitDuration)
  const opacity = easeCinematic(enter) * (1 - easeCinematic(exit))
  const span = (to ?? from + enterDuration) - from
  return {
    active: opacity > 0.001,
    enter,
    exit,
    opacity,
    local: clamp(span > 0 ? (elapsed - from) / span : 1),
  }
}

/** Convenience: raw 0..1 ramp between two chapter-clock times. */
export function useRamp(from: number, to: number): number {
  const { elapsed } = usePresentation()
  return clamp((elapsed - from) / Math.max(to - from, 0.0001))
}
