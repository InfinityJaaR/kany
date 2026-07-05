'use client'

import { useEffect, useRef, useState } from 'react'
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const styles = heroVideoStyles(theme, heroVideoConfig)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (paused) {
      video.pause()
      return
    }
    void video.play().catch(() => {})
  }, [paused])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        style={styles.video}
        src={heroVideoConfig.src}
      />
      <div
        className="absolute inset-0"
        style={styles.overlay ?? undefined}
        hidden={!styles.overlay}
      />
      <div className="absolute inset-0" style={styles.gradient} />
    </div>
  )
}
