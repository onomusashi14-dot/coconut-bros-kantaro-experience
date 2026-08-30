/**
 * Chapter 5 beat map, in seconds from the chapter's start.
 *
 * The whole reveal runs 24s, inside the 18–26s the brief asks for. These numbers
 * are the contract between three things that must agree exactly: the DOM copy,
 * the WebGL transformation, and the Blender render that will replace it. If the
 * render's beats move, move them here too.
 */
export const HERO = {
  anticipation: [0, 4] as const,
  impact: [4, 6.5] as const,
  formation: [6.5, 16] as const,
  labelReveal: [16, 20] as const,
  /** Silent hero hold. The chapter settles at 24s and then waits for the presenter. */
  hold: [20, 24] as const,
  /** Crossfade window from rendered video to the live Three.js bottle. */
  handoff: [20.4, 22.0] as const,
  /**
   * Dissolve from the live bottle into the approved raster hero for the final
   * hold, when that still is supplied. Unlike `handoff` this is a dissolve, not
   * a matched cut — the still is a studio shot, so it is timed to land in the
   * silence after the reveal rather than to hide a seam.
   */
  rasterCross: [22.2, 23.8] as const,
  total: 24,
}
