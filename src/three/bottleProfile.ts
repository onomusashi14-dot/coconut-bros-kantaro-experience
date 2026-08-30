import * as THREE from 'three'

/**
 * The Siam Reserve silhouette, in metres, origin at the base centre.
 *
 * This is a proportion stand-in, not the product. When
 * `assets/models/siam-reserve-bottle.glb` lands it replaces the lathe entirely;
 * the profile stays here only so the transformation particles and the live model
 * agree on scale and framing.
 */
export const BOTTLE_HEIGHT = 0.232

interface ProfilePoint {
  y: number
  r: number
}

const KEY_POINTS: ProfilePoint[] = [
  { y: 0.0, r: 0.0 },
  { y: 0.0, r: 0.0345 },
  { y: 0.006, r: 0.0378 },
  { y: 0.02, r: 0.0385 },
  { y: 0.104, r: 0.0385 },
  { y: 0.118, r: 0.0378 },
  { y: 0.142, r: 0.031 },
  { y: 0.163, r: 0.0205 },
  { y: 0.176, r: 0.0152 },
  { y: 0.196, r: 0.0142 },
  { y: 0.212, r: 0.0142 },
  { y: 0.2185, r: 0.0166 },
  { y: 0.226, r: 0.0166 },
  { y: 0.2285, r: 0.0138 },
  { y: 0.232, r: 0.0 },
]

/** Ridge depth on the body, matching the brief's "bottle ridges become visible". */
function ridge(y: number): number {
  if (y < 0.026 || y > 0.098) return 0
  return Math.sin((y - 0.026) * Math.PI * 2 * 34) * 0.00042
}

export function bottleProfilePoints(segments = 120): THREE.Vector2[] {
  const points: THREE.Vector2[] = []
  const curveY = KEY_POINTS.map((p) => p.y)
  const curveR = KEY_POINTS.map((p) => p.r)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = t * BOTTLE_HEIGHT
    // Piecewise-linear interpolation over the key points, plus the ridge detail.
    let r = curveR[curveR.length - 1]
    for (let k = 0; k < curveY.length - 1; k++) {
      if (y >= curveY[k] && y <= curveY[k + 1]) {
        const span = curveY[k + 1] - curveY[k]
        const local = span === 0 ? 0 : (y - curveY[k]) / span
        r = curveR[k] + (curveR[k + 1] - curveR[k]) * local
        break
      }
    }
    points.push(new THREE.Vector2(Math.max(r + ridge(y), 0), y))
  }
  return points
}

/** A point on the bottle surface, used to aim the transformation particles. */
export function sampleBottleSurface(points: THREE.Vector2[], u: number, theta: number, out = new THREE.Vector3()) {
  const idx = Math.min(points.length - 1, Math.max(0, Math.round(u * (points.length - 1))))
  const p = points[idx]
  return out.set(Math.cos(theta) * p.x, p.y, Math.sin(theta) * p.x)
}
