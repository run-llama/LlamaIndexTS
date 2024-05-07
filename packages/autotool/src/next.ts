import type { NextConfig } from "next";
import { createWebpackPlugin } from "unplugin";
import { unpluginFactory } from "./plugin";

const webpackPlugin = createWebpackPlugin(unpluginFactory);

export function withNext(config: NextConfig) {
  return {
    ...config,
    webpack: (webpackConfig: any, context: any) => {
      webpackConfig = config.webpack?.(webpackConfig, context) ?? webpackConfig;
      webpackConfig.plugins.push(webpackPlugin());
      return webpackConfig;
    },
  };
}
