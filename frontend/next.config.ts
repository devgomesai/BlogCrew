import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react-syntax-highlighter"],
  },
};

export default nextConfig;
