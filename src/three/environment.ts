import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useThree } from '@react-three/fiber'

/**
 * A locally generated environment map.
 *
 * Transmissive glass needs something to refract. Every ready-made HDRI preset
 * fetches from a CDN, which the offline requirement rules out, so the
 * environment is generated on the GPU from Three's own room scene instead —
 * no files, no network, and dark enough to stay inside the palette.
 */
export function useLocalEnvironment(intensity = 0.55): THREE.Texture | null {
  const gl = useThree((s) => s.gl)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    setTexture(target.texture)
    return () => {
      target.dispose()
      pmrem.dispose()
      room.traverse((child) => {
        const mesh = child as THREE.Mesh
        mesh.geometry?.dispose?.()
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(material)) material.forEach((m) => m.dispose())
        else material?.dispose?.()
      })
      setTexture(null)
    }
  }, [gl])

  useEffect(() => {
    if (texture) texture.colorSpace = THREE.LinearSRGBColorSpace
  }, [texture])

  void intensity
  return texture
}
