/**
 * This is a node module loader hook that injects metadata into the source code.
 *
 * @module
 */
import { parse } from "@swc/core";
import type { ExpressionStatement } from "@swc/types";
import type { LoadHook } from "node:module";
import { fileURLToPath } from "node:url";
import { isJSorTS, isToolFile, transformAutoTool } from "./compiler";

export const load: LoadHook = async (url, context, nextLoad) => {
  const output = await nextLoad(url, context);
  if (typeof output.source === "string" && isJSorTS(url)) {
    const isTool = isToolFile(url);
    const hasToolDirective = (await parse(output.source)).body
      .filter(
        (node): node is ExpressionStatement =>
          node.type === "ExpressionStatement",
      )
      .some(
        (node) =>
          node.expression.type === "StringLiteral" &&
          node.expression.value === "use tool",
      );
    if (isTool || hasToolDirective) {
      const { code } = await transformAutoTool(
        output.source,
        fileURLToPath(url),
      );
      return {
        ...output,
        source: code,
      };
    }
  }
  return output;
};
