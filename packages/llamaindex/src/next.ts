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
    return webpackConfig;
  };
  return config;
}
