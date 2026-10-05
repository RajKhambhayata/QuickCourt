import type { Metadata } from 'next';
import './globals.css';
import PortalAwareShell from '@/components/PortalAwareShell';
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({ 
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://quickcourt.netlify.app'),
  title: {
    default: 'QuickCourt - Book Local Sports Facilities & Courts',
    template: '%s | QuickCourt',
  },
  description:
    'Discover and reserve local sports courts, turf grounds, badminton arenas, and tennis facilities in real-time.',
  keywords: [
    'sports court booking',
    'badminton court bangalore',
    'turf booking',
    'box cricket turf',
    'pickleball courts',
    'tennis courts',
    'quickcourt',
  ],
  authors: [{ name: 'QuickCourt Technologies' }],
  openGraph: {
    title: 'QuickCourt - Book Local Sports Facilities & Courts',
    description:
      'Discover and reserve local sports courts, turf grounds, badminton arenas, and tennis facilities in real-time.',
    url: 'https://quickcourt.netlify.app',
    siteName: 'QuickCourt',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickCourt - Book Local Sports Facilities & Courts',
    description:
      'Discover and reserve local sports courts, turf grounds, badminton arenas, and tennis facilities in real-time.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container font-sans antialiased">
        <PortalAwareShell>{children}</PortalAwareShell>
      </body>
    </html>
  );
}
