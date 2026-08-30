import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { assetUrl } from '../data/assets'
import { bottleProfilePoints, BOTTLE_HEIGHT } from './bottleProfile'
import { createCondensationTexture } from './textures'
import { clamp, easeCinematic } from '../animation/ease'

interface HeroBottleProps {
  envMap: THREE.Texture | null
  /** 0 → 1 as glass solidifies, ridges appear and water settles. */
  formation: number
  /** 0 → 1 across the label and seal reveal. */
  label: number
  /** Overall visibility, used for the crossfade out of the rendered video. */
  opacity: number
}

/**
 * The live hero bottle.
 *
 * `assets/models/siam-reserve-bottle.glb` is authoritative when it exists. Until
 * it does, a lathe built from the shared silhouette profile stands in — same
 * height, same framing, same materials — so the camera match and the handoff can
 * be developed and rehearsed now, and the real model drops straight in.
 */
export function HeroBottle(props: HeroBottleProps) {
  const modelUrl = assetUrl('model-bottle')
  return modelUrl ? <ModelBottle url={modelUrl} {...props} /> : <LatheBottle {...props} />
}

function useCompressedGltf(url: string, gl: THREE.WebGLRenderer) {
  return useLoader(GLTFLoader, url, (loader) => {
    // Three resolves both decoders through `import.meta.url`, so Vite bundles
    // them alongside the app. Nothing is fetched from a CDN, and a Draco- or
    // KTX2-compressed GLB loads with the machine offline.
    loader.setDRACOLoader(new DRACOLoader())
    loader.setKTX2Loader(new KTX2Loader().detectSupport(gl))
  })
}

function ModelBottle({ url, formation, opacity }: HeroBottleProps & { url: string }) {
  const gl = useThree((s) => s.gl)
  const gltf = useCompressedGltf(url, gl)
  const group = useRef<THREE.Group>(null)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])

  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh
        mesh.geometry?.dispose?.()
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(material)) material.forEach((m) => m.dispose())
        else material?.dispose?.()
      })
    }
  }, [scene])

  useFrame(() => {
    if (!group.current) return
    group.current.visible = opacity > 0.01
    group.current.scale.setScalar(0.98 + easeCinematic(formation) * 0.02)
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

function LatheBottle({ envMap, formation, label, opacity }: HeroBottleProps) {
  const group = useRef<THREE.Group>(null)
  const glassRef = useRef<THREE.Mesh>(null)
  const waterRef = useRef<THREE.Mesh>(null)
  const condensationRef = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Mesh>(null)
  const sealRef = useRef<THREE.Mesh>(null)

  const profile = useMemo(() => bottleProfilePoints(140), [])
  const glassGeometry = useMemo(() => new THREE.LatheGeometry(profile, 96), [profile])
  const waterGeometry = useMemo(() => {
    const inner = profile
      .filter((p) => p.y <= 0.163)
      .map((p) => new THREE.Vector2(Math.max(p.x - 0.0022, 0), p.y))
    inner.push(new THREE.Vector2(0, 0.163))
    return new THREE.LatheGeometry(inner, 72)
  }, [profile])
  const condensationTexture = useMemo(createCondensationTexture, [])

  const labelTextureUrl = assetUrl('siam-reserve-label')
  const labelTexture = useLoadedTexture(labelTextureUrl)

  useEffect(() => {
    return () => {
      glassGeometry.dispose()
      waterGeometry.dispose()
      condensationTexture.dispose()
    }
  }, [glassGeometry, waterGeometry, condensationTexture])

  useFrame(() => {
    if (!group.current) return
    group.current.visible = opacity > 0.005

    const solid = easeCinematic(clamp(formation / 0.55))
    const ridged = easeCinematic(clamp((formation - 0.35) / 0.35))
    const filled = easeCinematic(clamp((formation - 0.5) / 0.35))
    const dewed = easeCinematic(clamp((formation - 0.72) / 0.28))

    if (glassRef.current) {
      const material = glassRef.current.material as THREE.MeshPhysicalMaterial
      material.opacity = opacity
      material.transmission = 0.35 + solid * 0.65
      material.thickness = 0.002 + solid * 0.019
      material.roughness = 0.24 - ridged * 0.2
      material.envMapIntensity = 0.35 + solid * 0.75
    }
    if (waterRef.current) {
      waterRef.current.visible = filled > 0.01
      waterRef.current.scale.y = 0.35 + filled * 0.65
      const material = waterRef.current.material as THREE.MeshPhysicalMaterial
      material.opacity = filled * opacity
    }
    if (condensationRef.current) {
      const material = condensationRef.current.material as THREE.MeshStandardMaterial
      material.opacity = dewed * 0.5 * opacity
      condensationRef.current.visible = dewed > 0.01
    }
    if (labelRef.current) {
      const material = labelRef.current.material as THREE.MeshStandardMaterial
      const appear = easeCinematic(clamp(label / 0.6))
      material.opacity = appear * opacity
      labelRef.current.visible = appear > 0.01
    }
    if (sealRef.current) {
      const appear = easeCinematic(clamp((label - 0.55) / 0.45))
      const material = sealRef.current.material as THREE.MeshStandardMaterial
      material.opacity = appear * opacity
      sealRef.current.visible = appear > 0.01
      sealRef.current.scale.setScalar(0.6 + appear * 0.4)
    }
  })

  return (
    <group ref={group}>
      {/* Glass */}
      <mesh ref={glassRef} geometry={glassGeometry} castShadow={false}>
        <meshPhysicalMaterial
          color="#eaf3ec"
          transparent
          opacity={1}
          transmission={1}
          thickness={0.02}
          ior={1.5}
          roughness={0.05}
          metalness={0}
          envMap={envMap ?? undefined}
          envMapIntensity={1}
          clearcoat={0.6}
          clearcoatRoughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Coconut water */}
      <mesh ref={waterRef} geometry={waterGeometry}>
        <meshPhysicalMaterial
          color="#f2f6e4"
          transparent
          opacity={0}
          transmission={0.86}
          thickness={0.04}
          ior={1.34}
          roughness={0.08}
          attenuationColor={new THREE.Color('#e8f0cf')}
          attenuationDistance={0.34}
        />
      </mesh>

      {/* Condensation shell */}
      {/* Kept tight to the glass: the label band stands proud of it, and the two
          surfaces must not converge or they z-fight across the label. */}
      <mesh ref={condensationRef} geometry={glassGeometry} scale={1.002}>
        <meshStandardMaterial
          transparent
          opacity={0}
          roughness={0.15}
          metalness={0}
          color="#ffffff"
          alphaMap={condensationTexture}
          envMap={envMap ?? undefined}
          envMapIntensity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Label band. Blank until the approved artwork is supplied — no
          approximation of the Siam Reserve label is ever drawn. */}
      <mesh ref={labelRef} position={[0, 0.062, 0]}>
        <cylinderGeometry args={[0.0396, 0.0396, 0.078, 72, 1, true]} />
        <meshStandardMaterial
          color={labelTexture ? '#ffffff' : '#0f3b28'}
          map={labelTexture ?? undefined}
          transparent
          opacity={0}
          roughness={0.62}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cap seal */}
      <mesh ref={sealRef} position={[0, 0.2215, 0]}>
        <cylinderGeometry args={[0.0172, 0.0172, 0.019, 48]} />
        <meshStandardMaterial color="#8f6a24" transparent opacity={0} roughness={0.42} metalness={0.75} />
      </mesh>
    </group>
  )
}

/** Loads a texture only when its file actually exists. */
function useLoadedTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!url) {
      setTexture(null)
      return
    }
    let cancelled = false
    let loaded: THREE.Texture | null = null
    new THREE.TextureLoader().load(
      url,
      (result) => {
        if (cancelled) {
          result.dispose()
          return
        }
        result.colorSpace = THREE.SRGBColorSpace
        result.anisotropy = 8
        loaded = result
        setTexture(result)
      },
      undefined,
      // A label that fails to decode must not take the hero frame down with it.
      () => undefined,
    )
    return () => {
      cancelled = true
      loaded?.dispose()
      setTexture(null)
    }
  }, [url])

  return texture
}

export { BOTTLE_HEIGHT }
