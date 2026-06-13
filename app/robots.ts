import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ruh-mate.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/pricing', '/terms', '/privacy', '/login', '/signup'],
        disallow: [
          '/feed',
          '/profile/',
          '/wallet',
          '/buy',
          '/settings',
          '/admin/',
          '/api/',
          '/maintenance',
          '/verify-email',
          '/forgot',
          '/reset',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
