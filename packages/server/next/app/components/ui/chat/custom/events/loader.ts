/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from "@babel/parser";
import * as Babel from "@babel/standalone";
import traverse from "@babel/traverse";
import { JSONValue } from "@llamaindex/chat-ui";
import React, { FunctionComponent } from "react";
import { getConfig } from "../../../lib/utils";
import { ComponentDef } from "./types";

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
): Promise<FunctionComponent<{ events: JSONValue[] }> | null> {
  try {
    const [transpiledCode, resolvedImports] = await Promise.all([
      transpileCode(code, filename),
      parseImports(code),
    ]);

    return createComponentFromCode(
      transpiledCode,
      resolvedImports.imports,
      resolvedImports.componentName,
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

// The prefix of the module path for the components
const SHADCN_IMPORT_PREFIX = "@/components/ui";

// Maps module paths to dynamic imports, providing dependencies (e.g., Button) since imports are removed
// TODO: define all available components and icons
const SOURCE_MAP: Record<string, () => Promise<any>> = {
  [`${SHADCN_IMPORT_PREFIX}/button`]: () => import("../../../button"),
  [`${SHADCN_IMPORT_PREFIX}/accordion`]: () => import("../../../accordion"),
  [`${SHADCN_IMPORT_PREFIX}/card`]: () => import("../../../card"),
  [`${SHADCN_IMPORT_PREFIX}/badge`]: () => import("../../../badge"),
};

const SUPPORTED_MODULES = Object.keys(SOURCE_MAP);

// parse imports from code to get Function constructor arguments and component name
async function parseImports(code: string) {
  const imports: { name: string; source: string }[] = []; // e.g., [{ name: "Button", source: "@/components/ui/button" }]
  let componentName: string | null = null;

  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  // Traverse the AST to find import declarations
  traverse(ast, {
    // Find import declarations
    ImportDeclaration(path) {
      path.node.specifiers.forEach((specifier) => {
        if (
          specifier.type === "ImportSpecifier" ||
          specifier.type === "ImportDefaultSpecifier"
        ) {
          imports.push({
            name: specifier.local.name, // e.g., "Button"
            source: path.node.source.value, // e.g., "@/components/ui/button"
          });
        }
      });
    },
    // Find export default declaration
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;
      if (declaration.type === "FunctionDeclaration" && declaration.id) {
        componentName = declaration.id.name; // e.g., "EventTimeline"
      } else if (
        declaration.type === "Identifier" &&
        path.scope.hasBinding(declaration.name)
      ) {
        componentName = declaration.name; // e.g., named function assigned to export
      }
    },
  });

  // Dynamically import the modules
  const importPromises = imports.map(async ({ name, source }) => {
    if (!(source in SOURCE_MAP)) {
      throw new Error(
        `Fail to import ${name} from ${source}. Reason: Module not found. \nCurrently supported modules: ${SUPPORTED_MODULES.join(", ")}`,
      );
    }
    try {
      const module = await SOURCE_MAP[source]();
      return { name, module: module[name] };
    } catch (error) {
      throw new Error(
        `Failed to resolve import ${name}. Please check the code and try again.`,
      );
    }
  });

  const resolvedImports = await Promise.all(importPromises);

  // Create a map of import names to their resolved modules (always include React)
  const importMap: Record<string, any> = { React };
  resolvedImports.forEach(({ name, module }) => {
    if (module) {
      importMap[name] = module;
    }
  });

  // Prepare arguments for the Function constructor
  const argNames = Object.keys(importMap); // e.g., ["React", "Button", "Badge"]
  const argValues = Object.values(importMap); // list of corresponding modules

  return { componentName, imports: { argNames, argValues } };
}

async function createComponentFromCode(
  transpiledCode: string,
  imports: { argNames: string[]; argValues: any[] },
  componentName: string | null = "Component",
): Promise<FunctionComponent<{ events: JSONValue[] }> | null> {
  // Create the component function
  const componentFn = new Function(
    ...imports.argNames,
    `${transpiledCode}; return ${componentName};`,
  );

  // Call the component function with the imported modules
  return componentFn(...imports.argValues);
}
