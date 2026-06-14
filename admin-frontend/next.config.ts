import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:5000/api/admin/:path*',
      },
      {
        source: '/admin-assets/:path*',
        destination: 'http://localhost:5000/admin-assets/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*',
      },
    ]
  },
};

export default nextConfig;
