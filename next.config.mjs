/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled to avoid removeChild errors in Next.js 14.2.5 dev mode
  // (Known issue: React StrictMode + App Router SSR hydration)
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ]
      }
    ];
  }
};

export default nextConfig;
