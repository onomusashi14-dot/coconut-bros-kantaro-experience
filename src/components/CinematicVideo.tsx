import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { assetUrl } from '../data/assets'
import { clamp, lerp } from '../animation/ease'

/** Device pixel ratio is capped at 2: beyond that the cost buys nothing on a laptop. */
const MAX_DPR = 2
/** Frames the cache will try to hold. Beyond this, seeking directly is cheaper. */
const MAX_CACHED_FRAMES = 160

type Mode = 'cache' | 'seek' | 'poster'

interface CinematicVideoProps {
  assetId: string
  /** 0 → 1 through the clip. Driven by the chapter timeline, never by scroll. */
  progress: number
  /** Called once if the clip cannot be decoded at all. */
  onUnavailable?: () => void
  className?: string
  style?: CSSProperties
  /** Object-position style centre point, 0..1 on each axis. */
  focus?: [number, number]
}

/**
 * A timeline-scrubbed cinematic clip.
 *
 * Seeking an H.264 file every frame stutters on some laptops, so where the
 * browser can decode frames to bitmaps we build a frame cache in idle time and
 * scrub from that instead. Both paths draw through the same canvas with
 * object-cover mathematics, so the framing is identical and a hand-off between
 * them is invisible. If neither path survives, the poster still is shown and the
 * caller is told, so the chapter can fall back to its own rendering.
 */
export function CinematicVideo({ assetId, progress, onUnavailable, className, style, focus = [0.5, 0.5] }: CinematicVideoProps) {
  const url = assetUrl(assetId)
  const posterUrl = assetUrl('poster')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const framesRef = useRef<ImageBitmap[]>([])
  const targetRef = useRef(0)
  const smoothedRef = useRef(0)
  const modeRef = useRef<Mode>('seek')
  const [mode, setMode] = useState<Mode>('seek')
  const [ready, setReady] = useState(false)

  targetRef.current = clamp(progress)

  // ---------------------------------------------------------------- loading --
  useEffect(() => {
    if (!url) {
      onUnavailable?.()
      return
    }
    let cancelled = false
    const video = document.createElement('video')
    videoRef.current = video
    video.src = url
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.crossOrigin = 'anonymous'

    const fail = () => {
      if (cancelled) return
      modeRef.current = 'poster'
      setMode('poster')
      onUnavailable?.()
    }

    const onLoaded = () => {
      if (cancelled) return
      setReady(true)
      void buildCache(video, framesRef, () => cancelled).then((built) => {
        if (cancelled) return
        modeRef.current = built ? 'cache' : 'seek'
        setMode(built ? 'cache' : 'seek')
      })
    }

    video.addEventListener('loadeddata', onLoaded, { once: true })
    video.addEventListener('error', fail, { once: true })
    video.load()

    return () => {
      cancelled = true
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('error', fail)
      video.removeAttribute('src')
      video.load()
      framesRef.current.forEach((f) => f.close?.())
      framesRef.current = []
      videoRef.current = null
    }
  }, [url, onUnavailable])

  // ------------------------------------------------------------- draw loop --
  useEffect(() => {
    if (!url) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let raf = 0
    let stopped = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    const drawCover = (source: CanvasImageSource, sw: number, sh: number) => {
      const cw = canvas.width
      const ch = canvas.height
      if (!cw || !ch || !sw || !sh) return
      const scale = Math.max(cw / sw, ch / sh)
      const dw = sw * scale
      const dh = sh * scale
      const dx = (cw - dw) * focus[0]
      const dy = (ch - dh) * focus[1]
      ctx.drawImage(source, dx, dy, dw, dh)
    }

    const tick = () => {
      if (stopped) return
      raf = requestAnimationFrame(tick)
      if (document.hidden) return
      resize()

      // Lerped progress keeps the scrub cinematic rather than mechanical.
      smoothedRef.current = lerp(smoothedRef.current, targetRef.current, 0.16)
      const p = smoothedRef.current
      const video = videoRef.current

      if (modeRef.current === 'cache' && framesRef.current.length > 0) {
        const frames = framesRef.current
        const frame = frames[Math.min(frames.length - 1, Math.round(p * (frames.length - 1)))]
        if (frame) drawCover(frame, frame.width, frame.height)
        return
      }

      if (video && video.readyState >= 2 && Number.isFinite(video.duration)) {
        const wanted = p * video.duration
        if (!video.seeking && Math.abs(video.currentTime - wanted) > 0.03) {
          try {
            video.currentTime = wanted
          } catch {
            /* a seek can be refused mid-load; the next frame retries */
          }
        }
        drawCover(video, video.videoWidth, video.videoHeight)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
    }
  }, [url, focus])

  if (!url) return null

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      {(mode === 'poster' || !ready) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: posterUrl
              ? `#06110b center/cover no-repeat url(${posterUrl})`
              : 'radial-gradient(120% 90% at 50% 45%, #0d2417 0%, #06110b 62%)',
          }}
          aria-hidden="true"
        />
      )}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: mode === 'poster' ? 'none' : 'block' }}
        aria-hidden="true"
      />
    </div>
  )
}

/**
 * Decodes the clip into bitmaps a frame at a time, yielding between frames so
 * the UI never blocks. Returns false when the browser cannot do it, in which
 * case direct seeking takes over.
 */
async function buildCache(
  video: HTMLVideoElement,
  store: { current: ImageBitmap[] },
  cancelled: () => boolean,
): Promise<boolean> {
  if (typeof createImageBitmap !== 'function') return false
  const duration = video.duration
  if (!Number.isFinite(duration) || duration <= 0) return false

  const count = Math.min(MAX_CACHED_FRAMES, Math.max(24, Math.round(duration * 12)))
  const frames: ImageBitmap[] = []

  const seekTo = (t: number) =>
    new Promise<void>((resolve, reject) => {
      const done = () => {
        video.removeEventListener('seeked', done)
        video.removeEventListener('error', bad)
        resolve()
      }
      const bad = () => {
        video.removeEventListener('seeked', done)
        video.removeEventListener('error', bad)
        reject(new Error('seek failed'))
      }
      video.addEventListener('seeked', done)
      video.addEventListener('error', bad)
      video.currentTime = t
    })

  const yieldToUi = () =>
    new Promise<void>((resolve) => {
      const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number })
        .requestIdleCallback
      if (idle) idle(() => resolve(), { timeout: 60 })
      else window.setTimeout(resolve, 0)
    })

  try {
    for (let i = 0; i < count; i++) {
      if (cancelled()) break
      await seekTo((i / (count - 1)) * duration * 0.999)
      frames.push(await createImageBitmap(video))
      await yieldToUi()
    }
  } catch {
    frames.forEach((f) => f.close?.())
    return false
  }

  if (cancelled() || frames.length < 8) {
    frames.forEach((f) => f.close?.())
    return false
  }
  store.current = frames
  return true
}
