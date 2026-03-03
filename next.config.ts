import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.insforge.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jxc5fi6w.us-east.insforge.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ane7v4ce.insforge.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
