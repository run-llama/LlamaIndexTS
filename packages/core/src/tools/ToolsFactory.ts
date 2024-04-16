import { WikipediaTool } from "./WikipediaTool.js";

export namespace ToolsFactory {
  type ToolsMap = {
    [Tools.Wikipedia]: typeof WikipediaTool;
  };

  export enum Tools {
    Wikipedia = "wikipedia.WikipediaToolSpec",
  }

  export async function createTool<Tool extends Tools>(
    key: Tool,
    ...params: ConstructorParameters<ToolsMap[Tool]>
  ): Promise<InstanceType<ToolsMap[Tool]>> {
    if (key === Tools.Wikipedia) {
      return new WikipediaTool(...params) as InstanceType<ToolsMap[Tool]>;
    }

    throw new Error(
      `Sorry! Tool ${key} is not supported yet. Options: ${params}`,
    );
  }

  export async function createTools<const Tool extends Tools>(record: {
    [key in Tool]: ConstructorParameters<ToolsMap[Tool]>[1] extends any // backward compatibility for `create-llama` script // if parameters are an array, use them as is
      ? ConstructorParameters<ToolsMap[Tool]>[0]
      : ConstructorParameters<ToolsMap[Tool]>;
  }): Promise<InstanceType<ToolsMap[Tool]>[]> {
    const tools: InstanceType<ToolsMap[Tool]>[] = [];
    for (const key in record) {
      const params = record[key];
      tools.push(
        await createTool(
          key,
          // @ts-expect-error
          Array.isArray(params) ? params : [params],
        ),
      );
    }
    return tools;
  }
}
