/**
 * Ajustes del video de fondo del dashboard (página de inicio).
 *
 * Hay un bloque para modo claro (`light`) y otro para oscuro (`dark`).
 * Solo edita los números; no hace falta tocar componentes.
 *
 * Guía rápida:
 * - Video casi invisible → baja `gradient.*` y `overlay.opacity`
 * - Más color del video   → sube `video.opacity` y `video.saturation`
 * - Texto poco legible    → sube `gradient.middle` (centro, donde está el texto)
 * - Modo oscuro muy apagado → sube `dark.video.brightness` y baja `dark.gradient.*`
 */
export const heroVideoConfig = {
  src: '/video/fondoanimado.mp4',

  /** Velocidad de reproducción (1 = normal; más bajo = más lento) */
  playbackRate: 0.8,

  /**
   * Loop continuo con dos videos en crossfade (sin salto al reiniciar).
   * Segundos antes del final en que arranca el segundo video encima del primero.
   */
  loopOverlapSec: 0.8,

  /** Duración del fundido entre capas de video al reiniciar el ciclo */
  loopCrossfadeMs: 700,

  light: {
    video: {
      opacity: 0.9,
      saturation: 0.8,
      contrast: 1.05,
      brightness: 1.05,
      blurPx: 0,
      scale: 1.08,
    },
    overlay: {
      /** Capa uniforme extra (0 = desactivada). Mejor dejarla baja o en 0. */
      opacity: 0,
    },
    gradient: {
      /** Degradado sobre el video: más bajo = se ve más el fondo */
      top: 0.55,
      middle: 0.35,
      bottom: 0.5,
    },
  },

  dark: {
    video: {
      opacity: 0.95,
      saturation: 0.9,
      contrast: 1.15,
      /** Sube esto si en oscuro casi no se distingue el video */
      brightness: 1.35,
      blurPx: 0,
      scale: 1.08,
    },
    overlay: {
      opacity: 0.15,
    },
    gradient: {
      top: 0.6,
      middle: 0.42,
      bottom: 0.55,
    },
  },
} as const

export type HeroVideoThemeConfig = typeof heroVideoConfig.light
export type HeroVideoConfig = typeof heroVideoConfig
export type HeroVideoTheme = keyof Pick<HeroVideoConfig, 'light' | 'dark'>

/** @deprecated Usa heroVideoConfig.src */
export const DASHBOARD_VIDEO_PATH = heroVideoConfig.src

function backgroundWithAlpha(alpha: number) {
  return `oklch(from var(--background) l c h / ${alpha})`
}

export function heroVideoStyles(
  theme: HeroVideoTheme,
  config: HeroVideoConfig = heroVideoConfig,
) {
  const { video, overlay, gradient } = config[theme]

  return {
    video: {
      opacity: video.opacity,
      transform: `scale(${video.scale})`,
      filter: `saturate(${video.saturation}) contrast(${video.contrast}) brightness(${video.brightness}) blur(${video.blurPx}px)`,
    },
    overlay:
      overlay.opacity > 0
        ? { backgroundColor: backgroundWithAlpha(overlay.opacity) }
        : null,
    gradient: {
      background: `linear-gradient(to bottom, ${backgroundWithAlpha(gradient.top)}, ${backgroundWithAlpha(gradient.middle)}, ${backgroundWithAlpha(gradient.bottom)})`,
    },
  }
}
