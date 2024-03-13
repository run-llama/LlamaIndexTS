// @ts-ignore
import loader from "@assemblyscript/loader";
import fs from "fs";
import type { BaseTool, ToolMetadata } from "./types.js";
import { arrayKVtoObject, transformObject } from "./utils/object.js";

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

    const {
      ToolMetadata,
      ToolParameters,
      ToolParameterPropertyRecord,
      ToolParameterProperty,
    } = wasmInstance.exports;

    const { defaultMetadata, call } = wasmInstance.exports;
    const metadata = transformObject(
      getObjectByAddress(defaultMetadata, ToolMetadata),
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
    const callFunction = (...args: string[]): string => {
      const argsString = args.map((arg) => __pin(__newString(arg)));
      return __getString(call(...argsString));
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

    const wasmInstance = loader.instantiateSync(wasmFile, {
      http: {
        // import fetch from JavaScript and use it in WebAssembly
        get(url: string, headersString: string) {
          const stringHeaders = wasmInstance.exports
            .__getString(headersString)
            .split(",,,,");

          stringHeaders.pop();
          const headers: Record<string, string> = {};
          for (let i = 0; i < stringHeaders.length; i++) {
            headers[stringHeaders[i]] = stringHeaders[i + 1];
            i++;
          }
          fetch(wasmInstance.exports.__getString(url), {
            headers: {
              ...headers,
            },
            mode: "no-cors",
            method: "GET",
          })
            .then((fetched) => {
              fetched.json().then((data) => {
                console.log("Response from API call: ", data);
                // Add callback to handle data if needed
                return wasmInstance.exports.__newString(JSON.stringify(data));
              });
            })
            .catch((err) => {
              console.error(wasmInstance.exports.__newString(err.message));
            });
        },
      },
    });

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
