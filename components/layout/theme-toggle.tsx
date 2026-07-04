'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

function getDarkMode() {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  window.addEventListener('storage', onStoreChange)
  return () => {
    observer.disconnect()
    window.removeEventListener('storage', onStoreChange)
  }
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getDarkMode, () => false)

  const toggleTheme = () => {
    const newDarkMode = !getDarkMode()
    document.documentElement.classList.toggle('dark', newDarkMode)
    document.documentElement.classList.toggle('light', !newDarkMode)
    document.documentElement.style.colorScheme = newDarkMode ? 'dark' : 'light'
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
      aria-label="Cambiar tema"
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  )
}
