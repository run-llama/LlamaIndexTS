/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Babel from "@babel/standalone";
import { getConfig } from "../../../lib/utils";
import { parseImports } from "./import";
import { ComponentDef, EventRenderComponent } from "./types";

export type SourceComponentDef = {
  type: string;
  code: string;
  filename: string;
};

export async function fetchComponentDefinitions(): Promise<ComponentDef[]> {
  const endpoint = getConfig("COMPONENTS_API");
  if (!endpoint) return [];

  const response = await fetch(endpoint);
  const components = (await response.json()) as SourceComponentDef[];

  // Only need to handle transpilation now
  const transpiledComponents = await Promise.all(
    components.map(async (comp) => ({
      type: comp.type,
      comp: await parseComponent(comp.code, comp.filename),
    })),
  );

  return transpiledComponents.filter(
    (comp): comp is ComponentDef => comp.comp !== null,
  );
}

// create React component from code
async function parseComponent(
  code: string,
  filename: string,
): Promise<EventRenderComponent | null> {
  try {
    const [transpiledCode, importMap] = await Promise.all([
      transpileCode(code, filename),
      parseImports(code),
    ]);

    return createComponentFromCode(
      transpiledCode,
      importMap,
      importMap.componentName,
    );
  } catch (error) {
    console.warn(`Failed to parse component from ${filename}`, error);
    return null;
  }
}

// convert TSX code to JS code using Babel, also remove all import declarations in the top of code
async function transpileCode(code: string, filename: string) {
  const transpilationCustomPlugin = () => ({
    visitor: {
      ImportDeclaration(path: any) {
        // remove all import declarations in the top of code (already passed imports to Function constructor)
        // eg: import { Button } from "@/components/ui/button" -> remove
        path.remove();
      },
      ExportDefaultDeclaration(path: any) {
        // remove export default declaration (already passed component name to Function constructor)
        // eg: export default function EventTimeline() { ... } -> function EventTimeline() { ... }
        path.replaceWith(path.node.declaration);
      },
    },
  });

  const transpiledCode = Babel.transform(code, {
    presets: ["react", "typescript"],
    plugins: [transpilationCustomPlugin],
    filename,
  }).code;

  if (!transpiledCode) {
    throw new Error(`Transpiled code is empty for ${filename}`);
  }

  return transpiledCode;
}

async function createComponentFromCode(
  transpiledCode: string,
  importMap: Record<string, any>,
  componentName: string | null = "Component",
): Promise<EventRenderComponent | null> {
  const argNames = Object.keys(importMap); // e.g., ["React", "Button", "Badge"]
  const argValues = Object.values(importMap); // list of corresponding modules

  // Create the component function
  const componentFn = new Function(
    ...argNames,
    `${transpiledCode}; return ${componentName};`,
  );

  // Call the component function with the imported modules
  return componentFn(...argValues);
}
