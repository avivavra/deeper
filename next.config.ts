import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/elasticsearch/local/:path*',
        destination: 'http://localhost:9200/:path*',
      },
    ];
  },
};

export default nextConfig;
