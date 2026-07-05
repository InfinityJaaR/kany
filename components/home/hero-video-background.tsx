'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  heroVideoConfig,
  heroVideoStyles,
  type HeroVideoTheme,
} from '@/lib/branding/hero-video.config'

type HeroVideoBackgroundProps = {
  paused?: boolean
}

function getTheme(): HeroVideoTheme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function useHeroVideoTheme() {
  const [theme, setTheme] = useState<HeroVideoTheme>('light')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync theme from the DOM on mount, before observing changes
    setTheme(getTheme())

    const observer = new MutationObserver(() => setTheme(getTheme()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onMediaChange = () => setTheme(getTheme())
    media.addEventListener('change', onMediaChange)

    return () => {
      observer.disconnect()
      media.removeEventListener('change', onMediaChange)
    }
  }, [])

  return theme
}

export function HeroVideoBackground({ paused = false }: HeroVideoBackgroundProps) {
  const theme = useHeroVideoTheme()
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const activeLayerRef = useRef(0)
  const swappingRef = useRef(false)
  const [activeLayer, setActiveLayer] = useState(0)
  const styles = heroVideoStyles(theme, heroVideoConfig)

  const getLayerVideos = useCallback(() => {
    return activeLayerRef.current === 0
      ? { active: videoARef.current, incoming: videoBRef.current }
      : { active: videoBRef.current, incoming: videoARef.current }
  }, [])

  const applyPlaybackSettings = useCallback((video: HTMLVideoElement) => {
    video.playbackRate = heroVideoConfig.playbackRate
    video.loop = false
    video.muted = true
  }, [])

  const playVideo = useCallback(async (video: HTMLVideoElement | null) => {
    if (!video || paused) return
    applyPlaybackSettings(video)
    if (video.paused) {
      try {
        await video.play()
      } catch {
        /* autoplay policy */
      }
    }
  }, [applyPlaybackSettings, paused])

  const swapLayers = useCallback(async () => {
    if (swappingRef.current || paused) return

    const { active, incoming } = getLayerVideos()
    if (!active || !incoming) return
    if (!Number.isFinite(active.duration) || active.duration <= 0) return

    swappingRef.current = true

    incoming.currentTime = 0
    applyPlaybackSettings(incoming)
    await playVideo(incoming)

    const nextLayer = activeLayerRef.current === 0 ? 1 : 0
    activeLayerRef.current = nextLayer
    setActiveLayer(nextLayer)

    window.setTimeout(() => {
      active.pause()
      active.currentTime = 0
      swappingRef.current = false
    }, heroVideoConfig.loopCrossfadeMs)
  }, [applyPlaybackSettings, getLayerVideos, paused, playVideo])

  useEffect(() => {
    const videoA = videoARef.current
    const videoB = videoBRef.current
    if (!videoA || !videoB) return

    applyPlaybackSettings(videoA)
    applyPlaybackSettings(videoB)

    if (paused) {
      videoA.pause()
      videoB.pause()
      return
    }

    void playVideo(videoA)

    const onTimeUpdate = () => {
      const { active } = getLayerVideos()
      if (!active || swappingRef.current) return
      if (!Number.isFinite(active.duration) || active.duration <= 0) return

      const triggerAt = active.duration - heroVideoConfig.loopOverlapSec
      if (active.currentTime >= triggerAt) {
        void swapLayers()
      }
    }

    const onStalled = () => {
      void playVideo(getLayerVideos().active)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void playVideo(getLayerVideos().active)
      }
    }

    videoA.addEventListener('timeupdate', onTimeUpdate)
    videoB.addEventListener('timeupdate', onTimeUpdate)
    videoA.addEventListener('stalled', onStalled)
    videoB.addEventListener('stalled', onStalled)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      videoA.removeEventListener('timeupdate', onTimeUpdate)
      videoB.removeEventListener('timeupdate', onTimeUpdate)
      videoA.removeEventListener('stalled', onStalled)
      videoB.removeEventListener('stalled', onStalled)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [applyPlaybackSettings, getLayerVideos, paused, playVideo, swapLayers])

  const crossfadeMs = heroVideoConfig.loopCrossfadeMs
  const baseVideoStyle = styles.video

  const layerStyle = (layer: 0 | 1): CSSProperties => ({
    ...baseVideoStyle,
    opacity: activeLayer === layer ? baseVideoStyle.opacity : 0,
    transition: `opacity ${crossfadeMs}ms ease-in-out`,
    zIndex: activeLayer === layer ? 1 : 0,
  })

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-background"
      aria-hidden
    >
      <video
        ref={videoARef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={layerStyle(0)}
        src={heroVideoConfig.src}
        onCanPlay={() => {
          void playVideo(videoARef.current)
        }}
      />
      <video
        ref={videoBRef}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={layerStyle(1)}
        src={heroVideoConfig.src}
      />
      <div
        className="absolute inset-0 z-[2]"
        style={styles.overlay ?? undefined}
        hidden={!styles.overlay}
      />
      <div className="absolute inset-0 z-[2]" style={styles.gradient} />
    </div>
  )
}
