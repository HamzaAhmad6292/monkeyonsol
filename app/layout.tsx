import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Monkey',
  description: 'Created',
  generator: 'dev',
  twitter: {
    card: 'monkeyonsol',
    site: 'monkeyonsol',
    creator: '@paw_agent',
    title: 'Monkey Picasso Art',
    description: 'Create and share your AI-generated art with Monkey Picasso!',
    images: [{ url: '/images/twitter-card-default.jpg' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
