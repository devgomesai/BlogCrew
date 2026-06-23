import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app so Next.js doesn't infer it from a
  // stray lockfile higher up the tree (e.g. ~/pnpm-lock.yaml).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // react-syntax-highlighter pulls in the full Prism build (~300 language
  // grammars). Tree-shake it so only the languages actually used get compiled,
  // which cuts dev compile time dramatically.
  experimental: {
    optimizePackageImports: ["react-syntax-highlighter"],
  },
};

export default nextConfig;
