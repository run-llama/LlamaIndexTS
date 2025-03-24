/** @type {import('next').NextConfig} */
import withLlamaIndex from "llamaindex/next";

const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./cache/**/*"],
  },
  outputFileTracingExcludes: {
    "/api/files/*": [
      ".next/**/*",
      "node_modules/**/*",
      "public/**/*",
      "app/**/*",
    ],
  },
  transpilePackages: ["highlight.js"],
  webpack: (config) => {
    config.resolve.fallback = {
      aws4: false,
    };
    return config;
  },
};

// use withLlamaIndex to add necessary modifications for llamaindex library
export default withLlamaIndex(nextConfig);
