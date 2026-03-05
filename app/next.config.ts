import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Для Electron: базовый путь относительный
  basePath: "",
  assetPrefix: "./",
  trailingSlash: true,
};

export default nextConfig;
