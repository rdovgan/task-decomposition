import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  allowedDevOrigins: ["task.dovg.cloud"],
  devIndicators: false,
};

export default nextConfig;
