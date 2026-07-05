'use client'

import { useState } from 'react'

type ProductCardImageProps = {
  imageUrl?: string | null
  title: string
  category?: string | null
  store?: string | null
}

function isValidImageUrl(value?: string | null) {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized !== 'null' && normalized !== 'undefined' && normalized !== '' && /^https?:\/\//.test(normalized)
}

function getPastelBackground(category?: string | null, title?: string) {
  const text = `${category ?? ''} ${title ?? ''}`.toLowerCase()

  if (text.includes('comida') || text.includes('alimento') || text.includes('snack') || text.includes('premio')) {
    return 'from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-yellow-950/50'
  }

  if (text.includes('collar') || text.includes('correa') || text.includes('accesorio') || text.includes('juguete')) {
    return 'from-cyan-100 via-sky-50 to-blue-100 dark:from-cyan-950/60 dark:via-sky-950/40 dark:to-blue-950/50'
  }

  return 'from-violet-100 via-fuchsia-50 to-pink-100 dark:from-violet-950/60 dark:via-fuchsia-950/40 dark:to-pink-950/50'
}

export function ProductCardImage({ imageUrl, title, category }: ProductCardImageProps) {
  const [failed, setFailed] = useState(false)
  const showRealImage = isValidImageUrl(imageUrl) && !failed

  if (showRealImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl!}
        alt={title}
        className="h-44 w-full object-cover bg-muted"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${getPastelBackground(category, title)}`}>
      <div className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-white/45 blur-sm" />
      <div className="absolute right-4 -bottom-14 h-40 w-40 rounded-full bg-white/35 blur-sm" />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-md" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.35),transparent_22%),radial-gradient(circle_at_55%_90%,rgba(255,255,255,0.28),transparent_28%)]" />
    </div>
  )
}
