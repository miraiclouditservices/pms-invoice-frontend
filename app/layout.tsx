import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { AppLayout } from '../components/layout/AppLayout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d6efd',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://miraiclouditservices.com'),
  title: {
    default: 'MiraiCloud IT Solutions | Software Development & IT Services',
    template: '%s | MiraiCloud IT Solutions',
  },
  description:
    'MiraiCloud IT Solutions delivers innovative software development, web and mobile app development, cloud solutions, IT consulting, and digital transformation services.',
  keywords: [
    'MiraiCloud IT Solutions',
    'IT Solutions Company',
    'Software Development Company',
    'Web Development Company',
    'Mobile App Development',
    'Custom Software Development',
    'IT Services Company',
    'Cloud Solutions',
    'Digital Transformation',
    'IT Consulting Services',
    'IT Company in Hyderabad',
    'Software Development Company in Hyderabad',
    'Web Development Services in Hyderabad',
    'Mobile App Development Company in India',
    'IT Solutions Company in India',
  ],
  authors: [{ name: 'MiraiCloud IT Solutions', url: 'https://miraiclouditservices.com' }],
  creator: 'MiraiCloud IT Solutions',
  publisher: 'MiraiCloud IT Solutions',
  alternates: {
    canonical: 'https://miraiclouditservices.com',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-token',
  },
  other: {
    'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-site-verification-token',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://miraiclouditservices.com',
    siteName: 'MiraiCloud IT Solutions',
    title: 'MiraiCloud IT Solutions | Software Development & IT Services',
    description:
      'MiraiCloud IT Solutions delivers innovative software development, web and mobile app development, cloud solutions, IT consulting, and digital transformation services.',
    images: [
      {
        url: '/landing/mirai_logo.png',
        width: 1200,
        height: 630,
        alt: 'MiraiCloud IT Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiraiCloud IT Solutions | Software Development & IT Services',
    description:
      'MiraiCloud IT Solutions delivers innovative software development, web and mobile app development, cloud solutions, IT consulting, and digital transformation services.',
    images: ['/landing/mirai_logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  category: 'technology',
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
      '@id': 'https://miraiclouditservices.com/#organization',
      name: 'MiraiCloud IT Solutions',
      url: 'https://miraiclouditservices.com',
      logo: 'https://miraiclouditservices.com/landing/mirai_logo.png',
      image: 'https://miraiclouditservices.com/landing/mirai_logo.png',
      description:
        'MiraiCloud IT Solutions delivers innovative software development, web and mobile app development, cloud solutions, IT consulting, and digital transformation services.',
      telephone: '+919100218218',
      email: 'info@miraiclouditservices.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kalki chambers A Block 108, NH 65, widia colony Miyapur',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        postalCode: '502032',
        addressCountry: 'IN',
      },
      sameAs: [
        'https://www.linkedin.com/company/mirai-cloud-it-services/posts/?feedView=all',
        'https://www.instagram.com/miraicloud_itservices?igsh=MTRqczhxYjFyemx3bQ%3D%3D&utm_source=qr',
        'https://www.whatsapp.com/channel/0029Vb5ZMnB8fewwm8tvFk2c',
      ],
      priceRange: '$$',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://miraiclouditservices.com/#website',
      url: 'https://miraiclouditservices.com',
      name: 'MiraiCloud IT Solutions',
      publisher: {
        '@id': 'https://miraiclouditservices.com/#organization',
      },
      inLanguage: 'en-US',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body>
        <AuthProvider>
          <SocketProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
