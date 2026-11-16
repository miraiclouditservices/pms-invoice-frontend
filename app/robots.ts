import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://miraiclouditservices.com';

  const privateRoutes = [
    '/api/',
    '/dashboard/',
    '/properties/',
    '/buildings/',
    '/floors/',
    '/units/',
    '/occupancies/',
    '/invoices/',
    '/visitors/',
    '/cctv/',
    '/chat/',
    '/complaints/',
    '/work-orders/',
    '/roles/',
    '/users/',
    '/settings/',
    '/reports/',
    '/organisations/',
    '/billing/',
    '/parking/',
    '/agreements/',
    '/allocations/',
    '/assets-amc/',
    '/bookings/',
    '/coworking/',
    '/leases/',
    '/notifications/',
    '/residents/',
    '/vendors/',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/services/web-development',
          '/services/mobile-app-development',
          '/login',
          '/landing/*',
          '/favicon.ico',
          '/favicon.png',
        ],
        disallow: privateRoutes,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/services/web-development',
          '/services/mobile-app-development',
          '/login',
          '/landing/*',
        ],
        disallow: privateRoutes,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
