import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PresentationProvider, usePresentation } from './state/presentation'
import { AudioProvider } from './audio/AudioProvider'
import { Stage } from './components/Stage'
import { OpeningScreen } from './components/OpeningScreen'
import { PresenterOverlay } from './components/PresenterOverlay'
import { AssetDebugOverlay } from './components/AssetDebugOverlay'
import { useKeyboardControls } from './hooks/useKeyboardControls'
import { useScrollMode } from './hooks/useScrollMode'

export default function App() {
  return (
    <PresentationProvider>
      <AudioProvider>
        <Experience />
      </AudioProvider>
    </PresentationProvider>
  )
}

function Experience() {
  const { mode, started, overlay } = usePresentation()
  useKeyboardControls()
  useScrollMode(mode === 'scroll')

  useEffect(() => {
    document.body.dataset.mode = mode
    document.documentElement.dataset.mode = mode
  }, [mode])

  // The cursor is hidden during the presentation and returns whenever a control
  // surface is on screen.
  useEffect(() => {
    document.body.dataset.pointer = !started || overlay ? 'visible' : 'hidden'
  }, [started, overlay])

  return (
    <>
      <Stage />

      <AnimatePresence>
        {!started && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          >
            <OpeningScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overlay && (
          <motion.div
            key="presenter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            style={{ position: 'fixed', inset: 0, zIndex: 30 }}
          >
            <PresenterOverlay />
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'scroll' && <ScrollTrack />}
      <AssetDebugOverlay />
    </>
  )
}

function ScrollTrack() {
  const { chapter, elapsed } = usePresentation()
  return (
    <>
      <div className="scroll-track" aria-hidden="true" />
      <p className="scroll-hud">
        Scroll development mode · {chapter.marker} {chapter.title} · {elapsed.toFixed(1)}s /{' '}
        {chapter.duration.toFixed(0)}s
      </p>
    </>
  )
}
