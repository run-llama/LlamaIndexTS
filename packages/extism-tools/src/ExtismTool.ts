import createPlugin, { type ExtismPluginOptions } from "@extism/extism";
import type { BaseTool } from "@llamaindex/core/llms";

export abstract class ExtismTool<T> implements BaseTool<T> {
  readonly WASM_FILE_PATH = "./dist/wasm";
  wasmFilename!: string;
  metadata!: any;

  get pluginConfig(): ExtismPluginOptions {
    return {
      useWasi: true,
      runInWorker: true,
    };
  }

  async getPlugin() {
    return await createPlugin(
      `${this.WASM_FILE_PATH}/${this.wasmFilename}`,
      this.pluginConfig,
    );
  }
}
