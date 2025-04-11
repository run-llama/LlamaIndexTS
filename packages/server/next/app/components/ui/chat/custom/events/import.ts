/* eslint-disable @typescript-eslint/no-explicit-any */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import React from "react";

export const SHADCN_IMPORT_PREFIX = "@/components/ui"; // total 46 Shadcn components

// Maps import paths in component code to Shadcn components and ChatUI widgets
export const SOURCE_MAP: Record<string, () => Promise<any>> = {
  ///// SHADCN COMPONENTS /////
  [`${SHADCN_IMPORT_PREFIX}/accordion`]: () => import("../../../accordion"),
  [`${SHADCN_IMPORT_PREFIX}/alert`]: () => import("../../../alert"),
  [`${SHADCN_IMPORT_PREFIX}/alert-dialog`]: () =>
    import("../../../alert-dialog"),
  [`${SHADCN_IMPORT_PREFIX}/aspect-ratio`]: () =>
    import("../../../aspect-ratio"),
  [`${SHADCN_IMPORT_PREFIX}/avatar`]: () => import("../../../avatar"),
  [`${SHADCN_IMPORT_PREFIX}/badge`]: () => import("../../../badge"),
  [`${SHADCN_IMPORT_PREFIX}/breadcrumb`]: () => import("../../../breadcrumb"),
  [`${SHADCN_IMPORT_PREFIX}/button`]: () => import("../../../button"),
  [`${SHADCN_IMPORT_PREFIX}/calendar`]: () => import("../../../calendar"),
  [`${SHADCN_IMPORT_PREFIX}/card`]: () => import("../../../card"),
  [`${SHADCN_IMPORT_PREFIX}/carousel`]: () => import("../../../carousel"),
  [`${SHADCN_IMPORT_PREFIX}/chart`]: () => import("../../../chart"),
  [`${SHADCN_IMPORT_PREFIX}/checkbox`]: () => import("../../../checkbox"),
  [`${SHADCN_IMPORT_PREFIX}/collapsible`]: () => import("../../../collapsible"),
  [`${SHADCN_IMPORT_PREFIX}/command`]: () => import("../../../command"),
  [`${SHADCN_IMPORT_PREFIX}/context-menu`]: () =>
    import("../../../context-menu"),
  [`${SHADCN_IMPORT_PREFIX}/dialog`]: () => import("../../../dialog"),
  [`${SHADCN_IMPORT_PREFIX}/drawer`]: () => import("../../../drawer"),
  [`${SHADCN_IMPORT_PREFIX}/dropdown-menu`]: () =>
    import("../../../dropdown-menu"),
  [`${SHADCN_IMPORT_PREFIX}/form`]: () => import("../../../form"),
  [`${SHADCN_IMPORT_PREFIX}/hover-card`]: () => import("../../../hover-card"),
  [`${SHADCN_IMPORT_PREFIX}/input`]: () => import("../../../input"),
  [`${SHADCN_IMPORT_PREFIX}/input-otp`]: () => import("../../../input-otp"),
  [`${SHADCN_IMPORT_PREFIX}/label`]: () => import("../../../label"),
  [`${SHADCN_IMPORT_PREFIX}/menubar`]: () => import("../../../menubar"),
  [`${SHADCN_IMPORT_PREFIX}/navigation-menu`]: () =>
    import("../../../navigation-menu"),
  [`${SHADCN_IMPORT_PREFIX}/pagination`]: () => import("../../../pagination"),
  [`${SHADCN_IMPORT_PREFIX}/popover`]: () => import("../../../popover"),
  [`${SHADCN_IMPORT_PREFIX}/progress`]: () => import("../../../progress"),
  [`${SHADCN_IMPORT_PREFIX}/radio-group`]: () => import("../../../radio-group"),
  [`${SHADCN_IMPORT_PREFIX}/resizable`]: () => import("../../../resizable"),
  [`${SHADCN_IMPORT_PREFIX}/scroll-area`]: () => import("../../../scroll-area"),
  [`${SHADCN_IMPORT_PREFIX}/select`]: () => import("../../../select"),
  [`${SHADCN_IMPORT_PREFIX}/separator`]: () => import("../../../separator"),
  [`${SHADCN_IMPORT_PREFIX}/sheet`]: () => import("../../../sheet"),
  [`${SHADCN_IMPORT_PREFIX}/sidebar`]: () => import("../../../sidebar"),
  [`${SHADCN_IMPORT_PREFIX}/skeleton`]: () => import("../../../skeleton"),
  [`${SHADCN_IMPORT_PREFIX}/slider`]: () => import("../../../slider"),
  [`${SHADCN_IMPORT_PREFIX}/sonner`]: () => import("../../../sonner"),
  [`${SHADCN_IMPORT_PREFIX}/switch`]: () => import("../../../switch"),
  [`${SHADCN_IMPORT_PREFIX}/table`]: () => import("../../../table"),
  [`${SHADCN_IMPORT_PREFIX}/tabs`]: () => import("../../../tabs"),
  [`${SHADCN_IMPORT_PREFIX}/textarea`]: () => import("../../../textarea"),
  [`${SHADCN_IMPORT_PREFIX}/toggle`]: () => import("../../../toggle"),
  [`${SHADCN_IMPORT_PREFIX}/toggle-group`]: () =>
    import("../../../toggle-group"),
  [`${SHADCN_IMPORT_PREFIX}/tooltip`]: () => import("../../../tooltip"),

  ///// WIDGETS /////
  [`@llamaindex/chat-ui/widgets`]: () => import("@llamaindex/chat-ui/widgets"),

  ///// ICONS /////
  [`lucide-react`]: () => import("lucide-react"),
};

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
        `Fail to import ${name} from ${source}. Reason: Module not found. \nCurrently we only support importing UI components from Shadcn components, widgets from "llamaindex/chat-ui/widgets" and icons from "lucide-react". See https://ts.llamaindex.ai/docs/llamaindex/modules/ui/llamaindex-server for more information.`,
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
