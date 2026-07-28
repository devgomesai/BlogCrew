import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
  // blogs.ts reads ../backend/Blog, which makes Next trace above this folder and
  // nest the standalone output. Pin the root so server.js lands at the top.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  experimental: {
    optimizePackageImports: ["react-syntax-highlighter"],
  },
};

export default nextConfig;
