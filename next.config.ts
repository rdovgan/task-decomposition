import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // App is served at https://codereview.mybookingpal.com/task
  basePath: "/task",
  allowedDevOrigins: ["codereview.mybookingpal.com"],
  devIndicators: false,
};

export default nextConfig;
