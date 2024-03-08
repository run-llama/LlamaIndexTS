import * as loader from "@assemblyscript/loader";
import fs from "fs";

type ToolParameters = {
  type: string | "object";
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
};

interface ToolMetadata {
  description: string;
  name: string;
  parameters?: ToolParameters;
  argsKwargs?: Record<string, any>;
}

interface BaseTool {
  call?: (...args: any[]) => any;
  metadata: ToolMetadata;
}

interface RawToolMetadata {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Array<{
      key: string;
      value: {
        type: string;
        description: string;
      };
    }>;
    required?: string[];
  };
  argsKwargs?: Array<{
    key: string;
    value: string;
  }>;
}

export default class ToolFactory {
  /**
   * Transform the metadata from the assemblyscript raw format to the application format
   * Convert the properties from an Array to a Record<string, { type: string; description?: string }>
   * Convert the argsKwargs from an Array to a Record<string, any>
   */
  private static transformMetadata = (
    metadata: RawToolMetadata,
  ): ToolMetadata => {
    const parameters: ToolParameters = {
      type: metadata.parameters.type,
      properties: metadata.parameters.properties.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.key]: cur.value,
        }),
        {},
      ),
      required: metadata.parameters.required,
    };

    const argsKwargs = metadata.argsKwargs?.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.key]: JSON.parse(cur.value),
      }),
      {},
    );

    return {
      name: metadata.name,
      description: metadata.description,
      parameters,
      argsKwargs,
    };
  };

  private static getToolConfigs = (tool: string): BaseTool => {
    const wasmFile = fs.readFileSync(
      `node_modules/@llamaindex/tools/dist/${tool}.wasm`,
    );
    const wasmModule = loader.instantiateSync(wasmFile);
    const { defaultMetadata, call } = wasmModule.exports;
    const metadata = this.transformMetadata(defaultMetadata as RawToolMetadata);
    return {
      call: call as BaseTool["call"],
      metadata,
    };
  };

  private static configsToToolClass = (toolConfigs: BaseTool) => {
    return class implements BaseTool {
      call = toolConfigs.call;
      metadata: ToolMetadata;
      constructor(metadata: ToolMetadata) {
        this.metadata = metadata || toolConfigs.metadata;
      }
    };
  };

  public static get toolList(): string[] {
    return fs
      .readdirSync("node_modules/@llamaindex/tools/dist")
      .filter((file) => file.endsWith(".wasm"))
      .map((file) => file.replace(".wasm", ""));
  }

  public static toClass = (tool: string) => {
    const toolConfigs = this.getToolConfigs(tool);
    return this.configsToToolClass(toolConfigs);
  };
}
