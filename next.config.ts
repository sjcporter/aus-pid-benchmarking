import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/aus-pid-benchmarking" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/aus-pid-benchmarking" : "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
