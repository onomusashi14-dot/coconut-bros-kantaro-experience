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
