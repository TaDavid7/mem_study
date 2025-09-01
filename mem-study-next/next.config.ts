import type { NextConfig } from "next";

// redirecting
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true,
      },
    ];
  },


  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
