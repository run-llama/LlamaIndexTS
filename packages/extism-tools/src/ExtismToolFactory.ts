import createPlugin, { type Plugin } from "@extism/extism";
import type { JSONSchemaType } from "ajv";
import type { BaseTool, ToolMetadata } from "llamaindex";

const WASM_DIRECTORY = "./dist/wasm";
const MAX_HTTP_RESPONSE_BYTES = 100 * 1024 * 1024; // 100 MB

type ToolParams = Record<string, any>;

type ToolClassParams = {
  metadata?: ToolMetadata<JSONSchemaType<ToolParams>>;
};

type CreateToolClassParams = {
  wasmFilename: string;
  allowedHosts: string[];
  maxHttpResponseBytes: number;
  transformResponse: (response: any) => any;
};

const createPluginInstance = async (
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

export class ExtismToolFactory {
  static async createToolClass({
    wasmFilename,
    allowedHosts = [],
    maxHttpResponseBytes = MAX_HTTP_RESPONSE_BYTES,
    transformResponse = (response: any) => response,
  }: CreateToolClassParams): Promise<
    new (params: ToolClassParams) => BaseTool<ToolParams>
  > {
    const plugin = await createPluginInstance({
      wasmFilename,
      allowedHosts,
      maxHttpResponseBytes,
    });
    try {
      const wasmMetadata = await plugin.call("getMetadata");
      if (!wasmMetadata) {
        throw new Error("The WASM plugin did not return metadata.");
      }
      const defaultMetadata = wasmMetadata.json();

      return class implements BaseTool<ToolParams> {
        metadata: ToolMetadata<JSONSchemaType<ToolParams>>;

        constructor(params: ToolClassParams) {
          this.metadata = params?.metadata || defaultMetadata;
        }

        async call(input: ToolParams): Promise<string> {
          const pluginInstance = await createPluginInstance({
            wasmFilename,
            allowedHosts,
            maxHttpResponseBytes,
          });
          const data = await pluginInstance.call("call", JSON.stringify(input));
          if (!data) return "No result";
          const result = transformResponse(data.json());
          await pluginInstance.close();
          return result;
        }
      };
    } catch (e) {
      console.error(e);
      throw new Error("Failed to create WikipediaTool instance.");
    } finally {
      await plugin.close();
    }
  }
}
