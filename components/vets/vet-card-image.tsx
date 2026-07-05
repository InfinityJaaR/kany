'use client'

import { useState } from 'react'
import { Building2, HeartPulse, Scissors, ShieldCheck, ShoppingBag } from 'lucide-react'

type VetCardImageProps = {
  imageUrl?: string | null
  name: string
  emoji: string
  label: string
  gradient: string
}

function isValidImageUrl(value?: string | null) {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized !== 'null' && normalized !== 'undefined' && normalized !== '' && /^https?:\/\//.test(normalized)
}

function getPastelTheme(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('grooming')) {
    return {
      bg: 'from-rose-100 via-pink-50 to-orange-100 dark:from-rose-950/60 dark:via-pink-950/40 dark:to-orange-950/50',
      blob: 'bg-rose-200/70 dark:bg-rose-700/30',
      accent: 'bg-rose-400',
      icon: 'text-rose-600 dark:text-rose-300',
      Icon: Scissors,
    }
  }
  if (lower.includes('shop')) {
    return {
      bg: 'from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-cyan-950/50',
      blob: 'bg-emerald-200/70 dark:bg-emerald-700/30',
      accent: 'bg-emerald-400',
      icon: 'text-emerald-600 dark:text-emerald-300',
      Icon: ShoppingBag,
    }
  }
  if (lower.includes('hospital')) {
    return {
      bg: 'from-sky-100 via-blue-50 to-indigo-100 dark:from-sky-950/60 dark:via-blue-950/40 dark:to-indigo-950/50',
      blob: 'bg-sky-200/70 dark:bg-sky-700/30',
      accent: 'bg-sky-400',
      icon: 'text-sky-600 dark:text-sky-300',
      Icon: HeartPulse,
    }
  }
  return {
    bg: 'from-violet-100 via-fuchsia-50 to-amber-100 dark:from-violet-950/60 dark:via-fuchsia-950/40 dark:to-amber-950/50',
    blob: 'bg-violet-200/70 dark:bg-violet-700/30',
    accent: 'bg-violet-400',
    icon: 'text-violet-600 dark:text-violet-300',
    Icon: Building2,
  }
}

export function VetCardImage({ imageUrl, name, label }: VetCardImageProps) {
  const [failed, setFailed] = useState(false)
  const showRealImage = isValidImageUrl(imageUrl) && !failed

  if (showRealImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl!}
        alt={name}
        className="w-full h-40 object-cover bg-muted"
        onError={() => setFailed(true)}
      />
    )
  }

  const theme = getPastelTheme(label)
  const Icon = theme.Icon

  return (
    <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${theme.bg}`}>
      <div className={`absolute -left-8 -top-10 h-32 w-32 rounded-full ${theme.blob} blur-sm`} />
      <div className={`absolute right-4 -bottom-12 h-36 w-36 rounded-full ${theme.blob} blur-sm`} />
      <div className="absolute right-6 top-5 flex gap-1.5 opacity-60">
        <span className="h-2 w-2 rounded-full bg-white/80" />
        <span className="h-2 w-2 rounded-full bg-white/70" />
        <span className="h-2 w-2 rounded-full bg-white/60" />
      </div>

      <div className="relative h-full p-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-[1.75rem] bg-white/80 dark:bg-white/10 border border-white/70 dark:border-white/10 shadow-lg backdrop-blur flex items-center justify-center">
            <Icon className={`h-10 w-10 ${theme.icon}`} />
          </div>
          <span className={`absolute -right-1 -bottom-1 h-5 w-5 rounded-full ${theme.accent} border-4 border-white dark:border-card`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/70 dark:border-white/10 text-xs font-medium text-foreground/70 shadow-sm backdrop-blur">
            <ShieldCheck className={`w-3.5 h-3.5 ${theme.icon}`} /> {label}
          </div>
          <h3 className="mt-3 text-lg font-extrabold leading-tight text-foreground line-clamp-2">
            {name}
          </h3>
          <div className="mt-3 flex items-center gap-2 text-xs text-foreground/50">
            <span className={`h-1.5 w-10 rounded-full ${theme.accent}`} />
            <span>Directorio Kany</span>
          </div>
        </div>
      </div>
    </div>
  )
}
