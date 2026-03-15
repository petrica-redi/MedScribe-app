import path from "node:path";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// ─── Fix React Error #310 ──────────────────────────────────────────────
// Next.js 15.5 bundles its own React (19.2.0-canary) at
// next/dist/compiled/react. The client-side Next.js runtime (routing,
// hydration, Fiber tree) uses that compiled copy to set up hook dispatchers.
//
// If application code imports a DIFFERENT React from node_modules (19.2.4),
// its hooks read from a different ReactSharedInternals → dispatcher is null
// → Error #310.
//
// Fix: alias ALL client-side React imports to the SAME copy Next.js uses.
const nextDir = path.dirname(require.resolve("next/package.json"));
const nextCompiledReact = path.join(nextDir, "dist/compiled/react");
const nextCompiledReactDom = path.join(nextDir, "dist/compiled/react-dom");

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  poweredByHeader: false,
  redirects: async () => [
    {
      source: "/favicon.ico",
      destination: "/icon.png",
      permanent: false,
    },
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: nextCompiledReact,
        "react-dom": nextCompiledReactDom,
      };
    }
    return config;
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "microphone=(self), camera=(self)" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            isDev
              ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com"
              : "script-src 'self' 'unsafe-inline' https://accounts.google.com",
            "style-src 'self' 'unsafe-inline' https://accounts.google.com",
            "style-src-elem 'self' 'unsafe-inline' https://accounts.google.com",
            "img-src 'self' data: blob: https://*.googleusercontent.com https://lh3.googleusercontent.com",
            "font-src 'self' https://fonts.gstatic.com",
            `connect-src 'self' wss://*.supabase.co https://*.supabase.co wss://api.deepgram.com https://api.deepgram.com https://api.anthropic.com https://accounts.google.com https://oauth2.googleapis.com https://openidconnect.googleapis.com${isDev ? " wss://localhost:* http://localhost:*" : ""}`,
            "frame-src https://accounts.google.com",
            "media-src 'self' blob:",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
