import type {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7TypeName,
} from "json-schema";
import type { ToolMetadata } from "llamaindex";
import type { SourceMapInput } from "rollup";
import td from "typedoc";
import type { SourceMapCompact } from "unplugin";
import type { InfoString } from "./internal";

export const isToolFile = (url: string) => /\.tool\.[jt]sx?$/.test(url);
export const isJSorTS = (url: string) => /\.m?[jt]sx?$/.test(url);

async function parseRoot(entryPoint: string) {
  const app = await td.Application.bootstrapWithPlugins(
    {
      entryPoints: [entryPoint],
    },
    [
      new td.TypeDocReader(),
      new td.PackageJsonReader(),
      new td.TSConfigReader(),
    ],
  );
  const project = await app.convert();

  if (project) {
    return app.serializer.projectToObject(project, process.cwd());
  }
  throw new Error(`Failed to parse root ${entryPoint}`);
}

export async function transformAutoTool(
  code: string,
  url: string,
): Promise<{
  code: string;
  map?: SourceMapInput | SourceMapCompact | null;
}> {
  const json = await parseRoot(url);
  const children = json.children;
  if (Array.isArray(children)) {
    const schema = {
      type: "object",
      properties: {} as {
        [key: string]: JSONSchema7Definition;
      },
      additionalItems: false,
      required: [] as string[],
    } satisfies JSONSchema7;
    const info: InfoString = {
      originalFunction: undefined,
      parameterMapping: {},
    };
    children.forEach((child) => {
      // replace starting and ending quotes, to make it a function in the runtime
      info.originalFunction = child.name;
      const metadata: ToolMetadata = {
        name: child.name,
        description: "",
        parameters: schema,
      };
      child.signatures?.forEach((signature) => {
        const description = signature.comment?.summary
          .map((x) => x.text)
          .join("\n");
        if (description) {
          metadata.description += description;
        }
        signature.parameters?.map((parameter, idx) => {
          if (parameter.type?.type === "intrinsic") {
            // parameter.type.name
            schema.properties[parameter.name as string] = {
              type: parameter.type.name as JSONSchema7TypeName,
              description: parameter.comment?.summary
                .map((x) => x.text)
                .join("\n"),
            } as JSONSchema7Definition;
            schema.required.push(parameter.name as string);
            info.parameterMapping[parameter.name as string] = idx;
          }
        });
      });
      const infoJSON = JSON.stringify(info)
        // remove quotes from `originalFunction` value
        .replace(/"originalFunction":"(.*?)"/g, '"originalFunction":$1');
      code =
        code + `\ninjectMetadata(${JSON.stringify(metadata)}, ${infoJSON});`;
    });
  }
  if (
    !/^import\s+{\sinjectMetadata\s}\s+from\s+['"]@llamaindex\/tool['"]/.test(
      code,
    )
  ) {
    code = `import {injectMetadata} from '@llamaindex/autotool';\n${code}`;
  }
  return {
    code,
    map: null,
  };
}
