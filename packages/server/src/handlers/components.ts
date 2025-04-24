import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { promisify } from "util";
import { sendJSONResponse } from "../utils/request";

export const getComponents = async (
  req: IncomingMessage,
  res: ServerResponse,
  componentsDir: string,
) => {
  try {
    const exists = await promisify(fs.exists)(componentsDir);
    if (!exists) {
      return sendJSONResponse(res, 404, {
        error: "Components directory not found",
      });
    }

    const files = await promisify(fs.readdir)(componentsDir);

    // filter files with valid extensions
    const validExtensions = [".tsx", ".jsx"];
    const filteredFiles = files.filter((file) =>
      validExtensions.includes(path.extname(file)),
    );

    // filter duplicate components
    const uniqueFiles = filterDuplicateComponents(filteredFiles);

    const components = await Promise.all(
      uniqueFiles.map(async (file) => {
        const filePath = path.join(componentsDir, file);
        const content = await promisify(fs.readFile)(filePath, "utf-8");
        return {
          type: path.basename(file, path.extname(file)),
          code: content,
          filename: file,
        };
      }),
    );

    sendJSONResponse(res, 200, components);
  } catch (error) {
    console.error("Error reading components:", error);
    sendJSONResponse(res, 500, { error: "Failed to read components" });
  }
};

function filterDuplicateComponents(files: string[]) {
  const compMap = new Map<string, string>();

  for (const file of files) {
    const type = path.basename(file, path.extname(file));

    if (compMap.has(type)) {
      const existingComp = compMap.get(type)!;
      if (file.endsWith(".tsx") && !existingComp.endsWith(".tsx")) {
        // prefer .tsx files over others
        console.warn(`Preferring ${file} over ${existingComp}`);
        compMap.set(type, file);
      }
    } else {
      compMap.set(type, file);
    }
  }

  return Array.from(compMap.values());
}
