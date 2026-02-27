import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
