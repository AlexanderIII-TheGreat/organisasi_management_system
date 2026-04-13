import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN || 'localhost',
        pathname: '/storage/**',
      },
      // Juga izinkan http untuk development lokal
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;