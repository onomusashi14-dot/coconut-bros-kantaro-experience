import type { CSSProperties, ReactNode } from 'react'
import { useBeat, type BeatOptions } from '../animation/useBeat'
import { easeCinematic } from '../animation/ease'

export type FramePlacement = 'bottom-left' | 'center' | 'center-left' | 'top-left'
export type ScrimKind = 'bottom' | 'left' | 'center' | 'none'

interface BeatProps extends BeatOptions {
  /** Chapter-clock second at which the beat begins entering. */
  from: number
  /** Chapter-clock second at which the beat begins leaving. Omit to persist into the hold. */
  to?: number
  placement?: FramePlacement
  scrim?: ScrimKind
  /** Extra offset, e.g. to sit copy clear of the busiest part of the frame. */
  style?: CSSProperties
  className?: string
  /** Extra class on the inner copy block, e.g. `copy-block--wide`. */
  blockClassName?: string
  children: ReactNode
}

/**
 * One narrative beat. Beats are driven by the chapter clock rather than by
 * scroll, so the presenter can stop anywhere and the composition stays put.
 */
export function Beat({
  from,
  to,
  placement = 'bottom-left',
  scrim = 'none',
  style,
  className,
  blockClassName,
  children,
  ...options
}: BeatProps) {
  const beat = useBeat(from, to, options)
  if (!beat.active) return null

  const eased = easeCinematic(beat.enter)
  const frameStyle: CSSProperties = {
    opacity: beat.opacity,
    transform: `translate3d(0, ${(1 - eased) * 26}px, 0)`,
    ...style,
  }

  return (
    <>
      {scrim !== 'none' && <div className={`scrim scrim--${scrim}`} style={{ opacity: beat.opacity }} aria-hidden="true" />}
      <div className={`type-frame type-frame--${placement} ${className ?? ''}`} style={frameStyle}>
        <div className={`copy-block ${placement === 'center' ? 'copy-block--center' : ''} ${blockClassName ?? ''}`}>
          {children}
        </div>
      </div>
    </>
  )
}

interface RevealProps {
  /** 0 → 1. Usually a beat's `enter`. */
  progress: number
  /** Stagger index; each line lags the one above it. */
  index?: number
  children: ReactNode
  className?: string
  as?: 'span' | 'div'
}

/** A masked wipe: the line rises out of its own clip rather than fading up. */
export function Reveal({ progress, index = 0, children, className, as = 'span' }: RevealProps) {
  const staggered = Math.min(Math.max((progress - index * 0.14) / 0.86, 0), 1)
  const eased = easeCinematic(staggered)
  const Tag = as
  return (
    <Tag className={`mask-reveal ${className ?? ''}`}>
      <span
        style={{
          transform: `translate3d(0, ${(1 - eased) * 108}%, 0)`,
          opacity: staggered > 0 ? 1 : 0,
        }}
      >
        {children}
      </span>
    </Tag>
  )
}

/** Hero display line. Pass an array to get one masked wipe per line. */
export function Hero({ lines, progress = 1 }: { lines: string[]; progress?: number }) {
  return (
    <h2 className="hero-line">
      {lines.map((line, i) => (
        <Reveal key={line} progress={progress} index={i}>
          {line}
        </Reveal>
      ))}
    </h2>
  )
}

export function Statement({
  lines,
  progress = 1,
  compact = false,
}: {
  lines: string[]
  progress?: number
  /** A step down in size, for compositions that share the frame with an image. */
  compact?: boolean
}) {
  return (
    <h2 className={`statement-line ${compact ? 'statement-line--compact' : ''}`}>
      {lines.map((line, i) => (
        <Reveal key={line} progress={progress} index={i}>
          {line}
        </Reveal>
      ))}
    </h2>
  )
}

export function Support({ children }: { children: ReactNode }) {
  return <p className="support-line">{children}</p>
}

/** Japanese subtitle. Always live HTML text, never burned into a video frame. */
export function Ja({ lines }: { lines: string[] }) {
  return (
    <p className="ja-line" lang="ja">
      {lines.map((line) => (
        <span key={line} style={{ display: 'block' }}>
          {line}
        </span>
      ))}
    </p>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="label-line">{children}</p>
}
