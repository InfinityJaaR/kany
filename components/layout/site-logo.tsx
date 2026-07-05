import logoMeta from '@/lib/branding/logo-meta.json'
import {
  HEADER_LOGO_HEIGHT,
  LOGO_PUBLIC_PATH,
  headerLogoWidth,
  type LogoMeta,
} from '@/lib/branding/logo'

type SiteLogoProps = {
  height?: number
  className?: string
}

function LogoFallback({ height = HEADER_LOGO_HEIGHT, className }: SiteLogoProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent ${className ?? ''}`}
      style={{ width: height, height }}
    >
      <span className="font-bold text-white" style={{ fontSize: height * 0.55 }}>
        K
      </span>
    </div>
  )
}

export function SiteLogo({ height = HEADER_LOGO_HEIGHT, className }: SiteLogoProps) {
  const meta = logoMeta as LogoMeta
  if (!meta.validHeader) return <LogoFallback height={height} className={className} />

  const width = headerLogoWidth(meta, height)

  return (
    <img
      src={LOGO_PUBLIC_PATH}
      alt="Kany"
      width={width}
      height={height}
      className={`w-auto object-contain ${className ?? ''}`}
      style={{ height, width: 'auto' }}
      decoding="async"
    />
  )
}
