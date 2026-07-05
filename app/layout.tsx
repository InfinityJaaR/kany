import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import logoMeta from '@/lib/branding/logo-meta.json'
import { hasTabIcon, type LogoMeta } from '@/lib/branding/logo'
import './globals.css'

const meta = logoMeta as LogoMeta

const icons: Metadata['icons'] = hasTabIcon(meta)
  ? {
      icon: [
        { url: '/branding/favicon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/branding/favicon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/branding/apple-icon.png',
    }
  : {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    }

export const metadata: Metadata = {
  title: 'Kany',
  description: 'Plataforma comunitaria para mascotas perdidas en El Salvador',
  icons,
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', dark);
                document.documentElement.classList.toggle('light', !dark);
                document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${GeistSans.className} antialiased`}>{children}</body>
    </html>
  )
}
