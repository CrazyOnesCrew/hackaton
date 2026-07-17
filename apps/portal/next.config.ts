import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // When served behind the production reverse proxy at /portal (see deploy/Caddyfile).
  basePath: process.env.NEXT_BASE_PATH || undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn-ilegpid.nitrocdn.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "unpkg.com" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
