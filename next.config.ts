import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Allows file uploads up to 10MB
    },
  },
};

export default nextConfig;
