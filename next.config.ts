import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@napi-rs/canvas",
    "@napi-rs/canvas-win32-x64-msvc",
  ],

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;