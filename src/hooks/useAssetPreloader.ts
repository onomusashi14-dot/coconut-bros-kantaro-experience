import { useEffect, useState } from 'react'
import { assetStatuses, assetUrl } from '../data/assets'

export interface PreloadState {
  ready: boolean
  progress: number
  status: string
}

/**
 * Decodes the assets the opening chapters need before the experience starts.
 *
 * Only assets that actually exist are fetched — a missing file is a resolved
 * placeholder, not a pending download — and every failure is treated as
 * resolved, because nothing here may block the presenter.
 */
export function useAssetPreloader(chapters: number[]): PreloadState {
  const [state, setState] = useState<PreloadState>({ ready: false, progress: 0, status: 'Preparing' })

  useEffect(() => {
    let cancelled = false
    const wanted = assetStatuses().filter((a) => a.present && a.chapters.some((c) => chapters.includes(c)))

    const jobs: Promise<void>[] = wanted.map((asset) => {
      const url = assetUrl(asset.id)
      if (!url) return Promise.resolve()
      if (asset.kind === 'video') return decodeVideo(url)
      if (asset.kind === 'audio' || asset.kind === 'model' || asset.kind === 'font') return prefetch(url)
      return decodeImage(url)
    })

    // Local fonts must be resolved before the first masked text reveal, or the
    // first line reflows in front of the audience.
    const fonts = document.fonts?.ready ?? Promise.resolve()
    const all = [fonts.then(() => undefined), ...jobs]

    let done = 0
    const total = all.length
    setState({ ready: false, progress: 0, status: total > 1 ? 'Decoding opening assets' : 'Loading typography' })

    all.forEach((job) => {
      job
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return
          done += 1
          setState({
            ready: done >= total,
            progress: total === 0 ? 1 : done / total,
            status: done >= total ? 'Ready' : 'Decoding opening assets',
          })
        })
    })

    if (total === 0) setState({ ready: true, progress: 1, status: 'Ready' })

    return () => {
      cancelled = true
    }
  }, [chapters])

  return state
}

function decodeImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => resolve()
    image.src = url
  })
}

function decodeVideo(url: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    const done = () => resolve()
    video.addEventListener('loadeddata', done, { once: true })
    video.addEventListener('error', done, { once: true })
    video.src = url
    video.load()
  })
}

function prefetch(url: string): Promise<void> {
  return fetch(url).then(
    () => undefined,
    () => undefined,
  )
}
