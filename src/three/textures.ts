import * as THREE from 'three'

/**
 * Condensation, generated on a canvas at load time.
 *
 * Nothing about this is brand artwork — it is a physical surface effect — so
 * generating it locally keeps one more file out of the offline bundle without
 * misrepresenting anything.
 */
export function createCondensationTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, size, size)

  let seed = 991
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }

  for (let i = 0; i < 1400; i++) {
    const x = rand() * size
    const y = rand() * size
    const r = Math.pow(rand(), 2.4) * 7 + 0.6
    const alpha = 0.25 + rand() * 0.6
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`)
    gradient.addColorStop(0.65, `rgba(255,255,255,${alpha * 0.4})`)
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  // The lathe's UVs run 0–1 all the way around and up, which stretches a single
  // tile into bands; repeating keeps the droplets droplet-sized.
  texture.repeat.set(5, 3)
  texture.colorSpace = THREE.NoColorSpace
  return texture
}

/**
 * A pinnate frond mask.
 *
 * A palm frond is a rib with leaflets, not a solid blade. Cutting the blade's
 * silhouette with an alpha mask costs one small texture and gets far closer to
 * foliage than adding geometry would.
 */
export function createFrondAlpha(width = 256, height = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'

  const midX = width / 2
  // The rib.
  ctx.fillRect(midX - 3, 0, 6, height)

  const leaflets = 74
  for (let i = 0; i < leaflets; i++) {
    const t = i / (leaflets - 1)
    const y = t * height
    // Leaflets are longest in the middle third and shorten towards both ends.
    const span = Math.sin(Math.min(t * 1.25, 1) * Math.PI * 0.94) * (1 - t * 0.5)
    const reach = span * (midX - 4)
    const droop = 26 + t * 26

    for (const dir of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(midX, y - 5)
      ctx.quadraticCurveTo(midX + dir * reach * 0.6, y + droop * 0.35, midX + dir * reach, y + droop)
      ctx.lineTo(midX + dir * reach * 0.92, y + droop + 5)
      ctx.quadraticCurveTo(midX + dir * reach * 0.5, y + droop * 0.4, midX, y + 5)
      ctx.closePath()
      ctx.fill()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace
  return texture
}

/**
 * A soft circular falloff.
 *
 * Used as an alpha mask on the presentation surface so the plinth reads as
 * light landing on a table rather than as a hard-edged disc.
 */
export function createSoftDisc(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.52, 'rgba(255,255,255,0.92)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace
  return texture
}

/**
 * The deep tropical field the hero bottle stands in.
 *
 * Transmissive glass needs something behind it: against a flat black void the
 * bottle refracts nothing and reads as a silhouette. This is a very dark green
 * pool of light, well below the level that would count as a visible light
 * source in frame.
 */
export function createHeroBackdrop(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#030a06'
  ctx.fillRect(0, 0, size, size)
  const gradient = ctx.createRadialGradient(size / 2, size * 0.44, 0, size / 2, size * 0.44, size * 0.5)
  gradient.addColorStop(0, '#1d5236')
  gradient.addColorStop(0.4, '#0f2c1c')
  gradient.addColorStop(0.75, '#061309')
  gradient.addColorStop(1, '#030a06')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
