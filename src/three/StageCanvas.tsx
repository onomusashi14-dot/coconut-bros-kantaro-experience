import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { GroveScene } from './GroveScene'
import { BottleScene } from './BottleScene'
import { usePresentation } from '../state/presentation'
import { isAssetPresent } from '../data/assets'
import { clamp } from '../animation/ease'

/**
 * The single persistent WebGL layer.
 *
 * One canvas serves the whole presentation: mounting and unmounting a renderer
 * per chapter is the fastest way to leak GPU memory across seven forward-and-back
 * navigations. Scenes swap inside it, and rendering stops entirely when the page
 * is hidden or when no chapter needs WebGL.
 */
export function StageCanvas() {
  const { chapterIndex, elapsed, progress, held, chapter } = usePresentation()
  const [visible, setVisible] = useState(!document.hidden)

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const number = chapter.index
  const usesWebgl = number === 1 || number === 2 || number >= 4
  const videoDriven = isAssetPresent('vid-bottle-transformation')

  // Chapter 4 clears its copy and dissolves into the matched pre-roll frame over
  // its last few seconds, so the cut into the hero reveal has nothing to hide.
  const layerOpacity = !usesWebgl ? 0 : number === 4 ? clamp((elapsed - 22) / 3.5) : 1

  return (
    <div
      className="layer layer--webgl"
      style={{ opacity: layerOpacity, transition: number === 4 ? 'none' : 'opacity 700ms ease' }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={visible && usesWebgl ? 'always' : 'never'}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 32, near: 0.01, far: 60, position: [0, 0.12, 0.6] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.setClearColor('#06110b', 1)
        }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          {/* Compile materials up front: a shader compile during the hero
              reveal would be a visible hitch in front of the audience. */}
          <Preload all />
          {(number === 1 || number === 2) && (
            <GroveScene progress={progress} variant={number === 1 ? 'discovery' : 'provenance'} />
          )}
          {number >= 4 && (
            <BottleScene
              chapterIndex={number}
              elapsed={elapsed}
              progress={progress}
              held={held}
              videoDriven={videoDriven}
            />
          )}
        </Suspense>
      </Canvas>
      <span className="sr-only">
        Live three-dimensional rendering for chapter {chapterIndex + 1}: {chapter.title}.
      </span>
    </div>
  )
}
