/** @type {import('next').NextConfig} */
const nextConfig = {
  // All pages are dynamic - no static generation at build time
  // This prevents timeout errors when backend is unreachable during Vercel build
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

module.exports = nextConfig;
