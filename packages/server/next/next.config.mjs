/** @type {import('next').NextConfig} */
import fs from "fs";
import withLlamaIndex from "llamaindex/next";
import webpack from "./webpack.config.mjs";

const nextConfig = JSON.parse(fs.readFileSync("./next.config.json", "utf-8"));
nextConfig.webpack = webpack;

// use withLlamaIndex to add necessary modifications for llamaindex library
export default withLlamaIndex(nextConfig);
