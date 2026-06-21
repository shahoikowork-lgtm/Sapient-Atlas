import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is nested inside a parent folder that has its own lockfile, so
  // Turbopack would otherwise infer the wrong workspace root. Pin it here.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
