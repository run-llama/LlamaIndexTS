/**
 * This is a Next.js configuration file that is used to customize the build process.
 *
 * @example
 * ```js
 * // next.config.js
 * const withLlamaIndex = require("llamaindex/next")
 *
 * module.exports = withLlamaIndex({
 *  // Your Next.js configuration
 * })
 * ```
 *
 * This is only for Next.js projects, do not export this function on top-level.
 *
 * @module
 */
export default function withLlamaIndex(config: any) {
  config.experimental = config.experimental ?? {};
  // copy WASM files to the NextJS build (needed or tiktoken)
  config.experimental.outputFileTracingIncludes =
    config.experimental.outputFileTracingIncludes ?? {};
  config.experimental.outputFileTracingIncludes["/**/*"] = [
    "./node_modules/**/*.wasm",
  ];
  // needed for transformers, see https://huggingface.co/docs/transformers.js/en/tutorials/next#step-2-install-and-configure-transformersjs
  config.experimental.serverComponentsExternalPackages =
    config.experimental.serverComponentsExternalPackages ?? [];
  config.experimental.serverComponentsExternalPackages.push(
    "@xenova/transformers",
  );
  const userWebpack = config.webpack;
  config.webpack = function (webpackConfig: any) {
    if (userWebpack) {
      webpackConfig = userWebpack(webpackConfig);
    }
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      "@google-cloud/vertexai": false,
      "groq-sdk": false,
    };
    // Following lines will fix issues with onnxruntime-node when using pnpm
    // See: https://github.com/vercel/next.js/issues/43433
    webpackConfig.externals.push({
      "onnxruntime-node": "commonjs onnxruntime-node",
      sharp: "commonjs sharp",
    });
    return webpackConfig;
  };
  return config;
}
