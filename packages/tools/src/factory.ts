// @ts-ignore
import AsBind from "as-bind/dist/as-bind.cjs.js";
import fs from "fs";
// @ts-ignore
import HTTPImport from "./libs/http-import.js"; // TODO: test with js first then convert to ts
import type { BaseTool, ToolMetadata } from "./types.js";

export default class ToolFactory {
  /**
   * Transform the metadata from the assemblyscript raw format to the application format
   * Convert asm string to ts string
   * Convert asm array to ts array
   * Convert the properties from an Array to a Record<string, { type: string; description?: string }>
   * Convert the argsKwargs from an Array to a Record<string, any>
   */
  private static wasmInstanceToConfigs(wasmInstance: any): BaseTool {
    const { __pin, __unpin, __getString, __getArray, __newString } =
      wasmInstance.exports;

    const getObjectByAddress = (address: any, classWrapper: any) => {
      const object = classWrapper.wrap(__pin(address));
      __unpin(address);
      return object;
    };

    const transformObject = (
      obj: any,
      transfomer: Record<string, (value: any) => any>,
    ) => {
      const newObj: Record<string, any> = {};
      for (const key in transfomer) {
        newObj[key] = transfomer[key](obj[key]);
      }
      return newObj;
    };

    const arrayKVtoObject = (
      array: {
        key: string;
        value: any;
      }[],
    ) => {
      const obj: Record<string, any> = {};
      for (const item of array) {
        obj[item.key] = item.value;
      }
      return obj;
    };

    const {
      Tool,
      ToolMetadata,
      ToolParameters,
      ToolParameterPropertyRecord,
      ToolParameterProperty,
    } = wasmInstance.exports;

    const tool = new Tool();
    const metadata = transformObject(
      getObjectByAddress(tool.metadata, ToolMetadata),
      {
        name: __getString,
        description: __getString,
        parameters: (parameters) => {
          if (!parameters) return null;
          const parametersObj = getObjectByAddress(parameters, ToolParameters);
          return transformObject(parametersObj, {
            type: __getString,
            required: (required) => {
              const requiredArray = __getArray(required);
              return requiredArray.map(__getString);
            },
            properties: (properties) => {
              const propertiesArray = __getArray(properties);
              const arr = propertiesArray.map((property: any) => {
                return transformObject(
                  getObjectByAddress(property, ToolParameterPropertyRecord),
                  {
                    key: __getString,
                    value: (value) => {
                      return transformObject(
                        getObjectByAddress(value, ToolParameterProperty),
                        {
                          type: __getString,
                          description: __getString,
                        },
                      );
                    },
                  },
                );
              });
              return arrayKVtoObject(arr);
            },
          });
        },
      },
    ) as ToolMetadata;

    // Wrap assemblyscript function to a ts function
    const callFunction = (...args: any[]): any => {
      const argsString = args.map((arg) => __newString(arg.toString()));
      return __getString(tool.call(...argsString));
    };

    return {
      metadata,
      call: callFunction,
    };
  }

  private static initWasmInstanceFromFile = (filePath: string) => {
    const wasmFile = fs.readFileSync(
      `node_modules/@llamaindex/tools/dist/${filePath}.wasm`,
    );
    const http = new HTTPImport();
    const imports = {
      ...http.wasmImports,
    };
    const wasmInstance = AsBind.instantiateSync(wasmFile, imports);
    http.wasmExports = wasmInstance.exports;
    return wasmInstance;
  };

  private static getToolConfigs = (filePath: string): BaseTool => {
    const wasmInstance = this.initWasmInstanceFromFile(filePath);
    const toolConfigs = this.wasmInstanceToConfigs(wasmInstance);
    return toolConfigs;
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
