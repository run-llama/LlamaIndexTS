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
  const relativePath = relative(packageDistDir, targetUrl);
  if (relativePath.startsWith(".") || relativePath.startsWith("/")) {
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
  return {
    url,
    format: "module",
  };
}
