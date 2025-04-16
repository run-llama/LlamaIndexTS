/**
 * This script will replace the resolved module with the corresponding fixture file.
 */
import { stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Define directories
const packageRootDir = fileURLToPath(new URL("../", import.meta.url)); // Root of llamaindex package
const fixturesDir = fileURLToPath(new URL("./fixtures", import.meta.url)); // Fixtures directory

// Subpaths to mock with fixtures
const subpathsToMock = ["llm/anthropic", "llm/ollama", "llm/openai"];

export async function resolve(specifier, context, nextResolve) {
  // Resolve the module using default resolution
  const result = await nextResolve(specifier, context);
  console.log(`Resolving specifier: ${specifier}, Resolved to: ${result.url}`);

  // Skip built-in modules
  if (result.format === "builtin" || result.url.startsWith("node:")) {
    return result;
  }

  // Convert resolved URL to a TypeScript path
  const targetUrl = fileURLToPath(result.url).replace(/\.js$/, ".ts");
  const relativePath = relative(packageRootDir, targetUrl);
  console.log(`Target URL: ${targetUrl}, Relative Path: ${relativePath}`);

  // Check if the path matches a subpath to mock
  let fixturePath = null;
  for (const subpath of subpathsToMock) {
    if (relativePath.startsWith(`${subpath}/dist`)) {
      // Map to fixture path (e.g., llm/anthropic/dist/index.ts -> llm/anthropic.ts)
      fixturePath = relativePath.replace(
        `${subpath}/dist/index.ts`,
        `${subpath}.ts`,
      );
      console.log(`Mapped to fixture: ${fixturePath}`);
      break;
    }
  }

  // If no matching subpath, fall back to original result
  if (!fixturePath) {
    console.log(
      `No fixture mapping for path: ${relativePath}, using original module`,
    );
    return result;
  }

  // Construct fixture URL
  const url = pathToFileURL(join(fixturesDir, fixturePath)).toString();
  console.log(`Checking fixture: ${url}`);

  // Check if fixture file exists
  const exist = await stat(fileURLToPath(url))
    .then((stat) => stat.isFile())
    .catch((err) => {
      if (err.code === "ENOENT") {
        console.log(
          `Fixture not found: ${url}, falling back to original module`,
        );
        return false;
      }
      throw err;
    });

  // If fixture doesn't exist, fall back to original module
  if (!exist) {
    return result;
  }

  if (context.parentURL && context.parentURL.includes("e2e/fixtures")) {
    console.log(`Ignoring fixture import from: ${context.parentURL}`);
    return result;
  }

  // Return fixture file
  console.log(`Using fixture: ${url}`);
  return {
    url,
    format: "module",
  };
}
