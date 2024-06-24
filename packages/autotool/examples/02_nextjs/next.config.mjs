import { withNext } from "@llamaindex/autotool/next";
import withLlamaIndex from "llamaindex/next";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withLlamaIndex(withNext(nextConfig));
