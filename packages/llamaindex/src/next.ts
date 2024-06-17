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
  const userWebpack = config.webpack;
  //#region hack for `@xenova/transformers`
  // Ignore node-specific modules when bundling for the browser
  // See https://webpack.js.org/configuration/resolve/#resolvealias
  config.webpack = function (webpackConfig: any) {
    if (userWebpack) {
      webpackConfig = userWebpack(webpackConfig);
    }
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
      "@google-cloud/vertexai": false,
    };
    return webpackConfig;
  };
  //#endregion
  return config;
}
