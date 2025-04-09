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
    const validExtensions = [".tsx", ".jsx"];
    const filteredFiles = files.filter((file) =>
      validExtensions.includes(path.extname(file)),
    );
    const components = await Promise.all(
      filteredFiles.map(async (file) => {
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
