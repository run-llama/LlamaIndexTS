import type { NextConfig } from "next";
import webpackPlugin from "./webpack";

export function withNext(config: NextConfig) {
  return {
    ...config,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webpack: (webpackConfig: any, context: any) => {
      webpackConfig = config.webpack?.(webpackConfig, context) ?? webpackConfig;
      webpackConfig.plugins.push(webpackPlugin());
      return webpackConfig;
    },
  };
}
