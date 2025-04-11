/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import React from "react";

// The prefix of the module path for the components
export const SHADCN_IMPORT_PREFIX = "@/components/ui";

// Maps module paths to dynamic imports, providing dependencies (e.g., Button) since imports are removed
// TODO: define all available components and icons
export const SOURCE_MAP: Record<string, () => Promise<any>> = {
  [`${SHADCN_IMPORT_PREFIX}/button`]: () => import("../../../button"),
  [`${SHADCN_IMPORT_PREFIX}/accordion`]: () => import("../../../accordion"),
  [`${SHADCN_IMPORT_PREFIX}/card`]: () => import("../../../card"),
  [`${SHADCN_IMPORT_PREFIX}/badge`]: () => import("../../../badge"),
};

export const SUPPORTED_MODULES = Object.keys(SOURCE_MAP);

// parse imports from code to get Function constructor arguments and component name
export async function parseImports(code: string) {
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

  return { componentName, importMap };
}
