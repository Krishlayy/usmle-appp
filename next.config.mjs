// Origin of the video CDN (e.g. https://videos.example.com). Empty locally: videos come from /public.
const videoOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_VIDEO_BASE_URL ? new URL(process.env.NEXT_PUBLIC_VIDEO_BASE_URL).origin : '';
  } catch {
    return '';
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['recharts', 'es-toolkit'],
  // /api/admin/* passes through the auth proxy, which buffers request bodies (default cap 10 MB).
  // Q-bank .docx uploads with embedded figures run well past that.
  experimental: { proxyClientMaxBodySize: '200mb' },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_DOMAIN || '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '*.cloudfront.net',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' blob: data: https: ${videoOrigin}; frame-src 'self' https://js.stripe.com https://www.youtube.com; connect-src 'self' https: ws: wss:;`,
          },
        ],
      },
    ];
  },
};

import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "usmle-app",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
  silent: true,
});
