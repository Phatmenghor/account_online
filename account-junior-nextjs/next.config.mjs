import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/ @type {import('next').NextConfig} */;
const nextConfig = {
  reactStrictMode: false, // Disable to prevent duplicate API calls from React 18 double-mount
  output: "standalone",

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  trailingSlash: false,
  swcMinify: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    config.stats = "errors-only";

    // Suppress infrastructure-level <w> warnings
    config.infrastructureLogging = {
      ...config.infrastructureLogging,
      level: "error",
    };

    config.ignoreWarnings = [
      /Module not found/,
      /Can't resolve/,
      /Critical dependency/,
      /the request of a dependency is an expression/,
      /Parsing of.*for build dependencies failed/,
      /PackFileCacheStrategy/,
    ];

    config.bail = false;
    return config;
  },
};

export default withNextIntl(nextConfig);
