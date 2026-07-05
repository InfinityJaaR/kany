export const LOGO_SOURCE_PATH = 'assets/branding/logo-source.png'
export const LOGO_PUBLIC_PATH = '/branding/logo.png'
export const FAVICON_PUBLIC_PATH = '/branding/favicon.png'

/** Altura del logo en el header (px). */
export const HEADER_LOGO_HEIGHT = 32

/** Tamaños cuadrados aceptados para favicon / apple-touch-icon. */
export const VALID_FAVICON_SIZES = [32, 48, 64, 128, 180, 192, 512] as const

export type LogoMeta = {
  width: number
  height: number
  isSquare: boolean
  validFavicon: boolean
  validHeader: boolean
  faviconGenerated?: boolean
  faviconSource?: string
  faviconSizes?: number[]
}

export function hasTabIcon(meta: LogoMeta): boolean {
  return meta.validFavicon || meta.faviconGenerated === true
}

export function parsePngDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24) return null
  const signature = buffer.subarray(0, 8)
  if (signature[0] !== 0x89 || signature[1] !== 0x50 || signature[2] !== 0x4e || signature[3] !== 0x47) {
    return null
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

export function validateLogoDimensions(width: number, height: number): LogoMeta {
  const isSquare = width === height
  const validFavicon =
    isSquare && VALID_FAVICON_SIZES.includes(width as (typeof VALID_FAVICON_SIZES)[number])
  const validHeader = width >= 32 && height >= 32 && width / height >= 0.5 && width / height <= 4

  return { width, height, isSquare, validFavicon, validHeader }
}

export function headerLogoWidth(meta: Pick<LogoMeta, 'width' | 'height'>, height = HEADER_LOGO_HEIGHT): number {
  return Math.round(height * (meta.width / meta.height))
}
