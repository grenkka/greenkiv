import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'greenkiv',
  description: 'Сімейний фотоальбом',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={`${geistSans.variable} h-full`}>
      <body
        className="min-h-full"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
      >
        {children}
      </body>
    </html>
  )
}
