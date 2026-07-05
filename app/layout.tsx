import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kany',
  description: 'Plataforma comunitaria para mascotas perdidas en El Salvador',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon2.png',
  },
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
      <body className="antialiased">{children}</body>
    </html>
  )
}
