import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type LogoProps = {
  size?: number
  showText?: boolean
  href?: string | null
  className?: string
}

export function Logo({ size = 32, showText = true, href = '/', className }: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.png"
        alt="Kany"
        width={size}
        height={size}
        className="rounded-lg shrink-0"
        priority
      />
      {showText && <span className="text-xl font-bold text-foreground">Kany</span>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition">
        {content}
      </Link>
    )
  }

  return content
}
