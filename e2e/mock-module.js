/**
 * This script will replace the resolved module with the corresponding fixture file.
 */
import { stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const packageDistDir = fileURLToPath(new URL("../dist", import.meta.url));
const fixturesDir = fileURLToPath(new URL("./fixtures", import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  const result = await nextResolve(specifier, context);
  if (result.format === "builtin" || result.url.startsWith("node:")) {
    return result;
  }
  const targetUrl = fileURLToPath(result.url).replace(/\.js$/, ".ts");
  let relativePath = relative(packageDistDir, targetUrl);
  // todo: make it more generic if we have more sub modules fixtures in the future
  if (relativePath.startsWith("../../llm/anthropic")) {
    relativePath = relativePath.replace(
      "../../llm/ollama/dist/index.ts",
      "llm/anthropic.ts",
    );
  } else if (relativePath.startsWith("../../llm/ollama")) {
    relativePath = relativePath.replace(
      "../../llm/ollama/dist/index.ts",
      "llm/ollama.ts",
    );
  } else if (relativePath.startsWith("../../llm/openai")) {
    relativePath = relativePath.replace(
      "../../llm/openai/dist/index.ts",
      "llm/openai.ts",
    );
  } else if (relativePath.startsWith(".") || relativePath.startsWith("/")) {
    if (result.url?.includes("llamaindex/agent")) {
      console.log("No fixture found for", result.url);
      console.log({ specifier, context, result, targetUrl, relativePath });
    }
    return result;
  }
  const url = pathToFileURL(join(fixturesDir, relativePath)).toString();
  const exist = await stat(fileURLToPath(url))
    .then((stat) => stat.isFile())
    .catch((err) => {
      if (err.code === "ENOENT") {
        return false;
      }
      throw err;
    });
  if (!exist) {
    return result;
  }
  if (context.parentURL.includes("e2e/fixtures")) {
    // ignore the fixture import itself
    return result;
  }
  return {
    url,
    format: "module",
  };
}
