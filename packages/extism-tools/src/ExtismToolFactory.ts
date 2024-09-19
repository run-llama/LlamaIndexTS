import createPlugin, { type Plugin } from "@extism/extism";
import type { JSONSchemaType } from "ajv";
import type { BaseToolWithCall, ToolMetadata } from "llamaindex";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const WASM_DIRECTORY = path.join(__dirname, "..", "dist", "wasm");
export const DEFAULT_MAX_HTTP_RESPONSE_BYTES = 100 * 1024 * 1024; // 100 MB

export type ToolParams = Record<string, any>;

export type ToolClassParams = {
  metadata?: ToolMetadata<JSONSchemaType<ToolParams>>;
};

export type CreateToolClassParams = {
  wasmFilename: string;
  allowedHosts: string[];
  maxHttpResponseBytes: number;
  transformResponse: (response: any) => any;
};

export const createPluginInstance = async (
  params: Omit<CreateToolClassParams, "transformResponse">,
): Promise<Plugin> => {
  const { wasmFilename, allowedHosts, maxHttpResponseBytes } = params;
  const plugin = await createPlugin(`${WASM_DIRECTORY}/${wasmFilename}`, {
    useWasi: true,
    runInWorker: true,
    allowedHosts,
    memory: { maxHttpResponseBytes },
  });
  return plugin;
};

export const DEFAULT_TOOL_PARAMS: Omit<CreateToolClassParams, "wasmFilename"> =
  {
    allowedHosts: ["*"],
    maxHttpResponseBytes: DEFAULT_MAX_HTTP_RESPONSE_BYTES,
    transformResponse: (response: any) => response,
  };

export class ExtismToolFactory {
  static async createToolClass(
    toolName: string,
    params: Omit<CreateToolClassParams, "wasmFilename"> = DEFAULT_TOOL_PARAMS,
  ): Promise<new (params?: ToolClassParams) => BaseToolWithCall<ToolParams>> {
    const config = { ...params, wasmFilename: `${toolName}.wasm` };
    const plugin = await createPluginInstance(config);
    try {
      const wasmMetadata = await plugin.call("getMetadata");
      if (!wasmMetadata) {
        throw new Error("The WASM plugin did not return metadata.");
      }
      const defaultMetadata = wasmMetadata.json();

      return class implements BaseToolWithCall<ToolParams> {
        metadata: ToolMetadata<JSONSchemaType<ToolParams>>;

        constructor(params?: ToolClassParams) {
          this.metadata = params?.metadata || defaultMetadata;
        }

        async call(input: ToolParams): Promise<string> {
          const pluginInstance = await createPluginInstance(config);
          const data = await pluginInstance.call("call", JSON.stringify(input));
          if (!data) return "No result";
          const result = config.transformResponse(data.json());
          await pluginInstance.close();
          return result;
        }
      };
    } catch (e) {
      console.error(e);
      throw new Error("Failed to create Tool instance.");
    } finally {
      await plugin.close();
    }
  }
}
