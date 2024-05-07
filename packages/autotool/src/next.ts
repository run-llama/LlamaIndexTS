import type { NextConfig } from "next";
import { createWebpackPlugin } from "unplugin";
import { unpluginFactory } from "./plugin";

const webpackPlugin = createWebpackPlugin(unpluginFactory);

export function withNext(config: NextConfig) {
  return {
    ...config,
    webpack: (config: any) => {
      config.plugins.push(webpackPlugin());
      return config;
    },
  };
}
