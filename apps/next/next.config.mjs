import { createMDX } from "fumadocs-mdx/next";
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // default timeout for static generation is 60s, but we need to increase it to 10 minutes due to the large number of document pages
  staticPageGenerationTimeout: 600,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["monaco-editor"],
  serverExternalPackages: [
    "@huggingface/transformers",
    "twoslash",
    "typescript",
  ],
  async redirects() {
    return [
      {
        source: "/docs/chat-ui/:path*.mdx",
        destination: "/docs/chat-ui/:path*",
        permanent: true,
      },
      {
        source: "/docs/workflows/:path*.mdx",
        destination: "/docs/workflows/:path*",
        permanent: true,
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      fs: { browser: "./fallback.js" },
    },
  },
  webpack: (config) => {
    if (Array.isArray(config.target) && config.target.includes("web")) {
      config.target = ["web", "es2020"];
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    config.resolve.fallback ??= {};
    config.resolve.fallback.fs = false;
    config.resolve.alias["replicate"] = false;
    return config;
  },
};

export default withMDX(config);
