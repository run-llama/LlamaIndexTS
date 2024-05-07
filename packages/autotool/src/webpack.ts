import { createWebpackPlugin } from "unplugin";
import { unpluginFactory } from "./plugin";

const webpackPlugin = createWebpackPlugin(unpluginFactory);

export default webpackPlugin;
