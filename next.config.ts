import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  outputFileTracingRoot: process.cwd()
};

export default nextConfig;
