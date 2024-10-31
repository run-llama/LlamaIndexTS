import { parse } from "@swc/core";
import type { ExpressionStatement } from "@swc/types";
import { createUnplugin, type UnpluginFactory } from "unplugin";
import { isJSorTS, isToolFile, transformAutoTool } from "./compiler";

export type Options = object;

const name = "llama-index-tool";

export const unpluginFactory: UnpluginFactory<Options | undefined> = () => ({
  name,
  async transform(code, id) {
    if (!isJSorTS(id)) {
      return code;
    }
    const isTool = isToolFile(id);
    const hasToolDirective = (await parse(code)).body
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
      return transformAutoTool(code, id);
    }
  },
});

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
