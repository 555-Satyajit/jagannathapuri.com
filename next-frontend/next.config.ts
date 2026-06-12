import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: `${backendUrl}/admin/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`
      },
      {
        source: '/admin-assets/:path*',
        destination: `${backendUrl}/admin-assets/:path*`
      },
      {
        source: '/api/auth/session/verify',
        destination: `${backendUrl}/auth/session/verify`
      },
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/:path*`
      }
    ]
  }
};

export default nextConfig;
