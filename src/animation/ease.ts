export const clamp = (v: number, min = 0, max = 1) => Math.min(Math.max(v, min), max)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const inverseLerp = (a: number, b: number, v: number) => (b === a ? 1 : clamp((v - a) / (b - a)))

/** Cinematic camera easing: long settle, no overshoot, no spring. */
export const easeCinematic = (t: number) => 1 - Math.pow(1 - clamp(t), 3)
/** Slow anticipation before a decisive move. */
export const easeAnticipate = (t: number) => clamp(t) * clamp(t) * clamp(t)
/** Symmetric settle used for crossfades. */
export const easeInOut = (t: number) => {
  const x = clamp(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
/** Fast, physically motivated fall-off after an impact. */
export const easeImpact = (t: number) => 1 - Math.pow(1 - clamp(t), 6)
