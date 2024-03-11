/** @type {import('next').NextConfig} */
import fs from "fs";
import _ from "lodash";

const nextConfig = JSON.parse(fs.readFileSync("./next.config.json", "utf-8"));
const webpackConfig = _.cloneDeep(nextConfig.webpack);

// webpack config must be a function in NextJS, to use a JSON as config, we merge the settings from next.config.json
nextConfig.webpack = (config) => {
  return _.merge(config, webpackConfig);
};

export default nextConfig;
