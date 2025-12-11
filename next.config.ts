import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed standalone output for now to debug build issues
  // output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
