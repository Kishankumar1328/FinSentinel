import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinSentinel — Intelligent Finance Management',
  description: 'AI-powered personal finance platform with voice entry, investment tracking, tax optimizer, family sharing, and beautiful real-time insights.',
  keywords: 'finance, budget, expenses, income, investment tracker, tax optimizer, family budgeting, AI finance, money management, voice entry',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'FinSentinel — Intelligent Finance Management',
    description: 'AI-powered personal finance platform. Know where every dollar goes.',
    type: 'website',
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased dark">
        {children}
        <Analytics />
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: 'oklch(0.14 0.016 265)',
              border: '1px solid oklch(0.26 0.022 265)',
              color: 'oklch(0.95 0.005 265)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              borderRadius: '14px',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  );
}
