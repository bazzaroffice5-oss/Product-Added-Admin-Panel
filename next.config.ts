import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
    qualities: [75, 85, 90, 95],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/office-control/login',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/office-control/dashboard',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/office-control/products',
        destination: '/products',
        permanent: false,
      },
      {
        source: '/office-control/products/new',
        destination: '/products/new',
        permanent: false,
      },
      {
        source: '/office-control/products/:id/edit',
        destination: '/products/:id/edit',
        permanent: false,
      },
      {
        source: '/office-control',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
