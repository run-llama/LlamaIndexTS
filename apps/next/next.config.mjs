import { createMDX } from "fumadocs-mdx/next";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["monaco-editor"],
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
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ["typescript"],
        filename: "static/[name].worker.js",
      }),
    );
    return config;
  },
};

export default withMDX(config);
