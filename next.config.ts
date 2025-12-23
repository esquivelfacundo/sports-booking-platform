import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Optimize for deployment
  output: 'standalone',
  // Configure image patterns (remotePatterns replaces deprecated domains)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
    ],
  },
  // Fix turbopack root warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
