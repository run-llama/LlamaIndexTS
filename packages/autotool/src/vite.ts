import { createVitePlugin } from "unplugin";
import { unpluginFactory } from "./plugin";

const vitePlugin = createVitePlugin(unpluginFactory);

export default vitePlugin;
