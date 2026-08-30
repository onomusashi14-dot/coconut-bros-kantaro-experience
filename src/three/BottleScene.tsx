import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useLocalEnvironment } from './environment'
import { HeroBottle } from './HeroBottle'
import { bottleProfilePoints, sampleBottleSurface } from './bottleProfile'
import { HERO } from './heroTimeline'
import { createHeroBackdrop, createSoftDisc } from './textures'
import { clamp, easeCinematic, easeImpact, inverseLerp, lerp } from '../animation/ease'

const VOID_COLOUR = new THREE.Color('#030a06')
const IVORY_COLOUR = new THREE.Color('#efe9dc')

export interface BottleSceneProps {
  /** 4 (the matched pre-roll frame), 5, 6 or 7. */
  chapterIndex: number
  /** Seconds into the chapter's cinematic sequence. */
  elapsed: number
  /** 0 → 1 across the chapter. */
  progress: number
  held: boolean
  /**
   * True when `bottle-transformation.mp4` is present: the rendered clip owns the
   * transformation, and WebGL only supplies the live bottle it hands off to.
   */
  videoDriven: boolean
}

export function BottleScene({ chapterIndex, elapsed, progress, held, videoDriven }: BottleSceneProps) {
  const envMap = useLocalEnvironment()
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)

  const isHero = chapterIndex === 5
  /**
   * Chapter 4 ends on this same composition — block, coconut, blade, identical
   * camera — so that the cut into chapter 5 is invisible.
   */
  const isMatchedPreRoll = chapterIndex === 4

  // --- hero beat mapping ----------------------------------------------------
  const formation = isMatchedPreRoll ? 0 : isHero ? clamp(inverseLerp(HERO.formation[0], HERO.formation[1], elapsed)) : 1
  const labelReveal = isMatchedPreRoll ? 0 : isHero ? clamp(inverseLerp(HERO.labelReveal[0], HERO.labelReveal[1], elapsed)) : 1
  const impact = isHero ? clamp(inverseLerp(HERO.impact[0], HERO.impact[1], elapsed)) : 0

  // Rendered video → live bottle. Outside chapter 5 the live bottle is simply on.
  const handoff = isHero ? clamp(inverseLerp(HERO.handoff[0], HERO.handoff[1], elapsed)) : 1
  const bottleOpacity = isMatchedPreRoll
    ? 0
    : videoDriven && isHero
      ? easeCinematic(handoff)
      : easeCinematic(clamp(formation / 0.25))

  // Slow rotation during the reveal, complete stillness during the hold. The
  // rotation is written straight onto the group so it keeps turning between
  // React renders.
  const bottleGroup = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!bottleGroup.current) return
    if (held) return
    if (isHero && elapsed > HERO.formation[0] && elapsed < HERO.hold[1]) {
      const easeOut = 1 - easeCinematic(clamp(inverseLerp(HERO.hold[0], HERO.hold[1], elapsed)))
      bottleGroup.current.rotation.y += delta * 0.12 * easeOut
    } else if (chapterIndex === 7) {
      bottleGroup.current.rotation.y += delta * 0.02
    }
  })

  // --- environment tone -----------------------------------------------------
  const tone = chapterIndex <= 5 ? 0 : chapterIndex === 6 ? easeCinematic(clamp((progress - 0.12) / 0.45)) : 1
  const toneRef = useRef(0)
  const backgroundRef = useRef(new THREE.Color().copy(VOID_COLOUR))

  useFrame((_, delta) => {
    toneRef.current = THREE.MathUtils.damp(toneRef.current, tone, 2.4, delta)
    backgroundRef.current.copy(VOID_COLOUR).lerp(IVORY_COLOUR, toneRef.current)
    scene.background = backgroundRef.current
    if (scene.fog) {
      ;(scene.fog as THREE.FogExp2).color.copy(backgroundRef.current)
      ;(scene.fog as THREE.FogExp2).density = lerp(1.9, 0.5, toneRef.current)
    }
  })

  useEffect(() => {
    return () => {
      scene.background = null
    }
  }, [scene])

  // --- camera ---------------------------------------------------------------
  useFrame((_, delta) => {
    let target: [number, number, number]
    let look: [number, number, number]

    if (chapterIndex <= 5) {
      // Anticipation sits low and close to the block; the reveal rises to the
      // hero framing that the Blender render must match exactly.
      const rise = isMatchedPreRoll ? 0 : easeCinematic(clamp(inverseLerp(HERO.impact[0], HERO.formation[1], elapsed)))
      // The settle finishes before the handoff window opens, so the frame the
      // Blender render has to match is completely still by then.
      const settle = isMatchedPreRoll
        ? 0
        : easeCinematic(clamp(inverseLerp(HERO.labelReveal[0], HERO.hold[0], elapsed)))
      const offset = -0.065 * settle
      target = [lerp(0.1, 0, rise) + offset, lerp(0.055, 0.125, rise), lerp(0.42, 0.6, rise)]
      // Looking slightly below the bottle's centre lifts it in frame; the lateral
      // offset moves it right and clears the left half for the wordmark.
      look = [offset, lerp(0.03, 0.105, rise), 0]
    } else if (chapterIndex === 6) {
      // Bottle slightly left, generous negative space at the right for the
      // Thailand–Japan line and for discussion.
      target = [0.14, 0.132, 0.66]
      look = [0.1, 0.116, 0]
    } else {
      const pull = easeCinematic(clamp(progress / 0.4))
      // The closing frame shifts the bottle right so the Bangkok store can sit
      // beside it as the other expression of the same brand.
      const pair = easeCinematic(clamp((progress - 0.8) / 0.2))
      target = [lerp(0, -0.145, pair), lerp(0.13, 0.15, pull), lerp(0.62, 0.95, pull)]
      look = [lerp(0, -0.145, pair), 0.116, 0]
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, target[0], 2.6, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target[1], 2.6, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target[2], 2.6, delta)
    camera.lookAt(look[0], look[1], look[2])
  })

  // The rendered clip owns the transformation when it exists; WebGL supplies the
  // live bottle it hands off to, and nothing else.
  const showTransformation = isHero && !videoDriven

  return (
    <>
      <fogExp2 attach="fog" args={['#030a06', 1.9]} />

      {/* No light is ever visible in frame, and there is no lens flare. Three's
          lights are physically weighted, so these values are higher than they
          look — under ACES the hero frame was reading almost black. */}
      <ambientLight intensity={0.55 + tone * 1.1} />
      <directionalLight position={[0.42, 0.7, 0.55]} intensity={3.4 + tone * 1.2} color="#fff6e2" />
      {/* The warm edge highlight: grazing, from behind and slightly above. */}
      <directionalLight position={[-0.55, 0.52, -0.34]} intensity={3.2} color="#e8b45c" />
      <directionalLight position={[0, -0.4, 0.3]} intensity={0.5} color="#2c6a43" />

      <HeroBackdrop tone={tone} />
      <BackdropLeaves tone={tone} />
      <PresentationSurface tone={tone} />

      <group ref={bottleGroup}>
        <HeroBottle envMap={envMap} formation={formation} label={labelReveal} opacity={bottleOpacity} />
      </group>

      {isMatchedPreRoll && <CuttingBlock elapsed={0} />}
      {showTransformation && (
        <>
          <CuttingBlock elapsed={elapsed} />
          <WaterFormation impact={impact} formation={formation} />
        </>
      )}
    </>
  )
}

/** The deep tropical field the glass refracts. */
function HeroBackdrop({ tone }: { tone: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const texture = useMemo(createHeroBackdrop, [])
  useEffect(() => () => texture.dispose(), [texture])

  useFrame((_, delta) => {
    if (!ref.current) return
    const material = ref.current.material as THREE.MeshBasicMaterial
    material.opacity = THREE.MathUtils.damp(material.opacity, 1 - tone, 2.4, delta)
    ref.current.visible = material.opacity > 0.02
  })

  return (
    <mesh ref={ref} position={[0, 0.14, -0.72]}>
      {/* Large enough that its own edges never enter frame at any aspect. */}
      <planeGeometry args={[5, 3.2]} />
      <meshBasicMaterial map={texture} transparent opacity={1} toneMapped={false} depthWrite={false} />
    </mesh>
  )
}

/** Barely visible enormous leaves, far behind the bottle. */
function BackdropLeaves({ tone }: { tone: number }) {
  const group = useRef<THREE.Group>(null)
  const placements = useMemo(
    () =>
      [
        { p: [-0.9, 0.5, -1.5], r: [0.2, 0.5, 0.7], s: 1.7 },
        { p: [1.0, 0.7, -1.8], r: [-0.15, -0.6, -0.5], s: 2.1 },
        { p: [0.1, -0.35, -1.2], r: [0.4, 0.1, 1.6], s: 1.4 },
        { p: [-1.3, -0.1, -2.2], r: [0.1, 0.8, -1.2], s: 2.6 },
      ] as { p: [number, number, number]; r: [number, number, number]; s: number }[],
    [],
  )

  const opacityRef = useRef(1)
  useFrame((_, delta) => {
    if (!group.current) return
    opacityRef.current = THREE.MathUtils.damp(opacityRef.current, 1 - tone, 2.4, delta)
    group.current.visible = opacityRef.current > 0.02
    group.current.children.forEach((child) => {
      const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
      material.opacity = opacityRef.current * 0.9
    })
  })

  return (
    <group ref={group}>
      {placements.map((leaf, i) => (
        <mesh key={i} position={leaf.p} rotation={leaf.r} scale={leaf.s}>
          <planeGeometry args={[1.5, 0.42, 1, 8]} />
          <meshStandardMaterial color="#082516" roughness={0.95} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

/** The refined wooden surface that resolves as the story moves to Japan. */
function PresentationSurface({ tone }: { tone: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const alphaMap = useMemo(createSoftDisc, [])
  useEffect(() => () => alphaMap.dispose(), [alphaMap])

  useFrame((_, delta) => {
    if (!ref.current) return
    const material = ref.current.material as THREE.MeshStandardMaterial
    material.opacity = THREE.MathUtils.damp(material.opacity, tone * 0.9, 2.2, delta)
    ref.current.visible = material.opacity > 0.02
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0008, 0]}>
      <circleGeometry args={[0.24, 64]} />
      {/* Alpha-masked so the surface fades out rather than ending in a hard
          ellipse across the lower third of the frame. */}
      <meshStandardMaterial
        color="#cdb492"
        roughness={0.72}
        metalness={0}
        transparent
        opacity={0}
        alphaMap={alphaMap}
        depthWrite={false}
      />
    </mesh>
  )
}

/** One coconut, one block, one blade — nothing else is left in frame. */
function CuttingBlock({ elapsed }: { elapsed: number }) {
  const group = useRef<THREE.Group>(null)
  const blade = useRef<THREE.Mesh>(null)
  const coconut = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!group.current) return
    // The store and the wood dissolve into deep tropical green-black.
    const dissolve = easeCinematic(clamp(inverseLerp(HERO.impact[1], HERO.formation[0] + 2.4, elapsed)))
    group.current.visible = dissolve < 0.99
    group.current.traverse((child) => {
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.MeshStandardMaterial | undefined
      if (material && 'opacity' in material) {
        material.transparent = true
        material.opacity = 1 - dissolve
      }
    })

    if (blade.current) {
      // Slow anticipation, then a decisive strike.
      const raise = easeCinematic(clamp(inverseLerp(HERO.anticipation[0], HERO.anticipation[1], elapsed)))
      const strike = easeImpact(clamp(inverseLerp(HERO.impact[0], HERO.impact[0] + 0.22, elapsed)))
      blade.current.position.y = lerp(0.1, 0.2, raise) - strike * 0.13
      blade.current.rotation.z = lerp(-0.5, -0.16, raise) + strike * 0.14
    }
    if (coconut.current) {
      const open = clamp(inverseLerp(HERO.impact[0] + 0.16, HERO.impact[1], elapsed))
      coconut.current.scale.set(1, 1 - open * 0.12, 1)
      coconut.current.position.y = 0.052 - open * 0.004
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.24, 0.024, 0.18]} />
        <meshStandardMaterial color="#6b4629" roughness={0.88} metalness={0} />
      </mesh>
      <mesh ref={coconut} position={[0, 0.052, 0]}>
        <sphereGeometry args={[0.043, 32, 24]} />
        <meshStandardMaterial color="#c9d894" roughness={0.85} metalness={0} />
      </mesh>
      <mesh ref={blade} position={[0.02, 0.2, 0.01]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.14, 0.004, 0.03]} />
        <meshStandardMaterial color="#e4e8e2" roughness={0.24} metalness={0.55} />
      </mesh>
    </group>
  )
}

const PARTICLES = 900

/**
 * Water rises rather than falls, hangs in the air, then resolves into the
 * bottle's silhouette. Each droplet carries its own delay so the silhouette
 * assembles from the base upward instead of snapping into place.
 */
function WaterFormation({ impact, formation }: { impact: number; formation: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const profile = useMemo(() => bottleProfilePoints(96), [])

  const particles = useMemo(() => {
    let seed = 2027
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    return Array.from({ length: PARTICLES }, () => {
      const u = Math.pow(rand(), 0.85)
      const theta = rand() * Math.PI * 2
      const target = sampleBottleSurface(profile, u, theta)
      const angle = rand() * Math.PI * 2
      const radius = rand() * 0.035
      return {
        origin: new THREE.Vector3(Math.cos(angle) * radius, 0.055 + rand() * 0.01, Math.sin(angle) * radius),
        apex: new THREE.Vector3(Math.cos(angle) * radius * 3.4, 0.16 + rand() * 0.12, Math.sin(angle) * radius * 3.4),
        target: target.clone(),
        delay: u * 0.45 + rand() * 0.25,
        size: 0.0018 + rand() * 0.0026,
        drift: rand() * Math.PI * 2,
      }
    })
  }, [profile])

  const scratch = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    if (!mesh.current) return
    const visible = impact > 0.001 && formation < 0.995
    mesh.current.visible = visible
    if (!visible) return

    const t = state.clock.elapsedTime
    particles.forEach((particle, i) => {
      const rise = easeImpact(clamp(impact))
      const settle = easeCinematic(clamp((formation - particle.delay) / Math.max(1 - particle.delay, 0.15)))

      // Origin → suspended apex → bottle surface.
      scratch.copy(particle.origin).lerp(particle.apex, rise)
      scratch.lerp(particle.target, settle)
      // Droplets suspend in space rather than simply travelling.
      const hover = (1 - settle) * rise * 0.004
      scratch.y += Math.sin(t * 1.3 + particle.drift) * hover
      scratch.x += Math.cos(t * 0.9 + particle.drift) * hover

      dummy.position.copy(scratch)
      dummy.scale.setScalar(particle.size * (1 - settle * 0.45))
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true

    const material = mesh.current.material as THREE.MeshStandardMaterial
    material.opacity = clamp(impact * 1.2) * (1 - easeCinematic(clamp((formation - 0.62) / 0.38)))
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLES]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      {/* Deliberately not a transmissive material: at this size the refraction
          is invisible, and 900 transmissive instances cost a full extra render
          pass on the presentation laptop. */}
      <meshStandardMaterial
        color="#eef7e6"
        emissive="#9fd4a8"
        emissiveIntensity={0.25}
        roughness={0.18}
        metalness={0}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </instancedMesh>
  )
}
