import type { Metadata } from 'next';
import { Fraunces, Syne, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.scss';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
});

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tatawur.ai'),
  title: {
    default:
      'Tatawur AI | Evolving the Physical World Through Intelligent Automation',
    template: '%s | Tatawur AI',
  },
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/brand/favicon-192.png', sizes: '192x192' },
  },
  description:
    'Intelligent automation for engineering-intensive industries. Tatawur AI delivers expert consulting across computational design, AI systems, digital twins, and robotics.',
  keywords: [
    'AI consulting',
    'intelligent automation',
    'computational design',
    'engineering software',
    'digital twin',
    'physical AI',
    'robotics software',
    'construction technology',
    'structural engineering',
    'software consulting',
  ],
  authors: [{ name: 'Tatawur AI LLC' }],
  creator: 'Tatawur AI LLC',
  publisher: 'Tatawur AI LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tatawur.ai',
    siteName: 'Tatawur AI',
    title:
      'Tatawur AI | Evolving the Physical World Through Intelligent Automation',
    description:
      'Intelligent automation for engineering-intensive industries. Expert consulting across computational design, AI systems, digital twins, and robotics.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Tatawur AI | Evolving the Physical World Through Intelligent Automation',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title:
      'Tatawur AI | Evolving the Physical World Through Intelligent Automation',
    description:
      'Intelligent automation for engineering-intensive industries. Expert consulting across computational design, AI systems, digital twins, and robotics.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
