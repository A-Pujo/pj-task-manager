import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    API_URL: process.env.API_URL || "http://localhost:5577/api/v1",
    NEXT_PUBLIC_API_URL: process.env.API_URL || "http://localhost:5577/api/v1",
  },
};

export default nextConfig;
