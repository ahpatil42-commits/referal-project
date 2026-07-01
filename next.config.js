/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        // Vercel Blob storage — profile photos and resume uploads
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Google / OAuth profile photos
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // LinkedIn profile photos
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },
  serverExternalPackages: ["pdf-parse", "mammoth"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            // connect-src:
            //   https://vercel.com              — Vercel Blob client generates token here
            //   https://*.public.blob.vercel-storage.com — actual blob PUT/GET destination
            //   https://vitals.vercel-insights.com — Vercel Analytics
            // img-src: https: covers blob CDN URLs
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com wss://*.pusher.com https://*.pusher.com https://vercel.com https://*.public.blob.vercel-storage.com https://vitals.vercel-insights.com; frame-src 'self' https://js.stripe.com;",
          },
        ],
      },
    ];
  },
};

const { withSentryConfig } = require("@sentry/nextjs");

const sentryOrg = process.env.SENTRY_ORG || undefined;
const sentryProject = process.env.SENTRY_PROJECT || undefined;

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: sentryOrg,
    project: sentryProject,
  },
  {
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);
