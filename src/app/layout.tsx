import type { Metadata } from 'next';
import { Outfit, DM_Sans, JetBrains_Mono, Aref_Ruqaa } from 'next/font/google';
import '@/styles/globals.scss';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tatawur.ai'),
  title: {
    default:
      'Tatawur AI | Evolving Construction Through Intelligent Automation',
    template: '%s | Tatawur AI',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  description:
    'Expert consulting services bridging traditional AEC workflows with cutting-edge software and AI solutions. Transform your construction business with Tatawur AI.',
  keywords: [
    'AEC consulting',
    'construction technology',
    'AI automation',
    'software consulting',
    'construction AI',
    'BIM integration',
    'digital transformation',
    'construction robotics',
    'structural engineering',
    'construction software',
  ],
  authors: [{ name: 'Tatawur AI LLC' }],
  creator: 'Tatawur AI LLC',
  publisher: 'Tatawur AI LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tatawur.ai',
    siteName: 'Tatawur AI',
    title: 'Tatawur AI | Evolving Construction Through Intelligent Automation',
    description:
      'Expert consulting services bridging traditional AEC workflows with cutting-edge software and AI solutions.',
    images: [
      {
        url: '/logo.svg',
        width: 500,
        height: 500,
        alt: 'Tatawur AI - Evolving Construction',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Tatawur AI | Evolving Construction Through Intelligent Automation',
    description:
      'Expert consulting services bridging traditional AEC workflows with cutting-edge software and AI solutions.',
    images: ['/logo.svg'],
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
      className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${arefRuqaa.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
