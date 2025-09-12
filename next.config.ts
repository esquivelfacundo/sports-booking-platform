import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Optimize for deployment
  output: 'standalone',
  // Configure image domains if needed
  images: {
    domains: ['localhost'],
  },
  // Fix turbopack root warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
