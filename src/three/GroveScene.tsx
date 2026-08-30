import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { clamp, easeCinematic, easeInOut, lerp } from '../animation/ease'
import { useLocalEnvironment } from './environment'

/**
 * The opening world: humid air, giant fronds, a cluster of young coconuts, and
 * one condensation droplet the camera travels through.
 *
 * The droplet is a transmissive sphere, so the inverted grove seen inside it is
 * genuine refraction rather than a painted texture — which is why it stays
 * correct as the camera moves.
 */

function createFrondGeometry(): THREE.BufferGeometry {
  const length = 2.6
  const segments = 26
  const geometry = new THREE.PlaneGeometry(0.52, length, 10, segments)
  const position = geometry.attributes.position as THREE.BufferAttribute

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const t = (y + length / 2) / length // 0 at base, 1 at tip

    // Taper towards the tip and pinch at the base.
    const width = Math.sin(Math.min(t * 1.35, 1) * Math.PI * 0.92) * (1 - t * 0.55)
    const nx = x * Math.max(width, 0.06)

    // Midrib droop plus a lateral curl, so the leaf reads as a real frond.
    const droop = -Math.pow(t, 2.1) * 0.72
    const curl = -Math.pow(Math.abs(x) * 2, 1.6) * 0.16 * (0.35 + t)

    position.setX(i, nx)
    position.setZ(i, droop + curl)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

interface FrondPlacement {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  shade: string
  sway: number
}

function buildFronds(): FrondPlacement[] {
  const palette = ['#0c2f1e', '#123d26', '#154a2e', '#1d5c39', '#25714a']
  const out: FrondPlacement[] = []
  let seed = 7
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }

  for (let i = 0; i < 44; i++) {
    const depth = -2.1 - rand() * 11
    const spread = 1.1 + Math.abs(depth) * 0.42
    out.push({
      position: [(rand() - 0.5) * spread * 2, 0.5 + (rand() - 0.5) * 3.6, depth],
      rotation: [(rand() - 0.5) * 0.7, (rand() - 0.5) * 1.3, (rand() - 0.5) * 2.4],
      scale: 0.8 + rand() * 1.6,
      shade: palette[Math.floor(rand() * palette.length)],
      sway: 0.4 + rand() * 1.4,
    })
  }
  return out
}

function Fronds({ energy }: { energy: number }) {
  const geometry = useMemo(createFrondGeometry, [])
  const placements = useMemo(buildFronds, [])
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      const sway = placements[i]?.sway ?? 1
      child.rotation.z = (placements[i]?.rotation[2] ?? 0) + Math.sin(t * 0.24 * sway + i) * 0.035 * energy
    })
  })

  return (
    <group ref={group}>
      {placements.map((frond, i) => (
        <mesh
          key={i}
          geometry={geometry}
          position={frond.position}
          rotation={frond.rotation}
          scale={frond.scale}
          castShadow={false}
        >
          <meshStandardMaterial color={frond.shade} roughness={0.82} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

function CoconutCluster({ position }: { position: [number, number, number] }) {
  const nuts = useMemo(
    () =>
      [
        [0, 0, 0],
        [0.16, -0.09, 0.05],
        [-0.15, -0.06, -0.04],
        [0.03, -0.19, -0.12],
        [-0.06, -0.21, 0.11],
      ] as [number, number, number][],
    [],
  )
  return (
    <group position={position}>
      {nuts.map((p, i) => (
        <mesh key={i} position={p} scale={[0.15, 0.172, 0.15]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshStandardMaterial color="#a9c471" roughness={0.86} metalness={0} />
        </mesh>
      ))}
      <mesh position={[0, 0.16, 0]} scale={[0.05, 0.12, 0.05]}>
        <cylinderGeometry args={[1, 0.7, 1, 8]} />
        <meshStandardMaterial color="#5d6b34" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Droplets({ count = 40, energy }: { count?: number; energy: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 43758.5453) % 1,
        y: (Math.sin(i * 78.233) * 12345.6789) % 1,
        z: (Math.sin(i * 39.425) * 24634.6345) % 1,
        speed: 0.06 + (Math.abs(Math.sin(i * 3.11)) % 1) * 0.12,
      })),
    [count],
  )

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    seeds.forEach((seed, i) => {
      const x = (Math.abs(seed.x) % 1) * 5 - 2.5
      const z = -0.8 - (Math.abs(seed.z) % 1) * 6
      const fall = ((Math.abs(seed.y) % 1) * 4 - t * seed.speed) % 4
      dummy.position.set(x, fall - 1.2, z)
      dummy.scale.setScalar(0.008 + (Math.abs(seed.x) % 1) * 0.008)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    const material = mesh.current.material as THREE.MeshStandardMaterial
    material.opacity = 0.55 * energy
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      {/* The hero droplet is the only refracting element in the grove; these are
          millimetres across and only need to catch the light. */}
      <meshStandardMaterial color="#dff0e4" roughness={0.05} metalness={0.1} transparent opacity={0.5} />
    </instancedMesh>
  )
}

function HeroDroplet({ envMap, reveal }: { envMap: THREE.Texture | null; reveal: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    // The droplet swells very slightly, then the camera passes through it.
    const t = state.clock.elapsedTime
    const breathe = 1 + Math.sin(t * 0.7) * 0.012
    ref.current.scale.setScalar(breathe * (1 - reveal * 0.15))
    const material = ref.current.material as THREE.MeshPhysicalMaterial
    material.opacity = clamp(1 - reveal * 1.6)
  })

  return (
    <mesh ref={ref} position={[0, 0.05, -0.32]}>
      <sphereGeometry args={[0.085, 64, 48]} />
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.02}
        transmission={1}
        thickness={0.12}
        ior={1.34}
        envMap={envMap ?? undefined}
        envMapIntensity={0.8}
        transparent
        clearcoat={1}
        clearcoatRoughness={0.03}
      />
    </mesh>
  )
}

export interface GroveSceneProps {
  /** 0 → 1 across the chapter's cinematic sequence. */
  progress: number
  /** Chapter 1 flies through the droplet; chapter 2 sits back in the grove. */
  variant: 'discovery' | 'provenance'
}

export function GroveScene({ progress, variant }: GroveSceneProps) {
  const envMap = useLocalEnvironment()
  const camera = useThree((s) => s.camera)
  const fogRef = useRef<THREE.FogExp2>(null)

  // Chapter 1 opens in complete blackness and pushes through the droplet.
  const pushThrough = variant === 'discovery' ? easeCinematic(clamp(progress / 0.3)) : 1
  const settle = easeInOut(clamp((progress - 0.28) / 0.5))

  useFrame((_, delta) => {
    const targetZ =
      variant === 'discovery' ? lerp(0.42, -0.62, pushThrough) - settle * 0.22 : -0.35 - settle * 0.2
    const targetY = variant === 'discovery' ? lerp(0.06, 0.46, settle) : 0.42
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3, delta)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, variant === 'provenance' ? 0.24 : 0, 2, delta)
    camera.lookAt(0, targetY + 0.12, -5)

    if (fogRef.current) {
      const veil = variant === 'discovery' ? 1 - easeCinematic(clamp(progress / 0.34)) : 0
      fogRef.current.density = lerp(0.2, 2.2, veil)
    }
  })

  const energy = variant === 'discovery' ? clamp((progress - 0.2) / 0.3) : 1

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={['#06110b', 1.6]} />
      <color attach="background" args={['#06110b']} />

      <hemisphereLight args={['#a9d08a', '#04120a', 0.55 * (0.35 + energy)]} />
      <directionalLight position={[2.6, 4.2, 1.4]} intensity={1.35 * (0.2 + energy)} color="#e8f2c9" />
      <directionalLight position={[-3, 1.4, -2.6]} intensity={0.5 * energy} color="#3f7d52" />

      <Fronds energy={energy} />
      <CoconutCluster position={[0.78, 0.5, -3.5]} />
      <CoconutCluster position={[-1.05, 1.0, -5.2]} />
      <CoconutCluster position={[0.15, 1.35, -7.4]} />
      <Droplets energy={energy} />
      {variant === 'discovery' && <HeroDroplet envMap={envMap} reveal={pushThrough} />}
    </>
  )
}
