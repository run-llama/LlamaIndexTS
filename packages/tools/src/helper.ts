import fs from "node:fs";
import path from "node:path";

export async function saveDocument(filePath: string, content: string | Buffer) {
  if (path.isAbsolute(filePath)) {
    throw new Error("Absolute file paths are not allowed.");
  }

  const dirPath = path.dirname(filePath);
  await fs.promises.mkdir(dirPath, { recursive: true });

  if (typeof content === "string") {
    await fs.promises.writeFile(filePath, content, "utf-8");
  } else {
    await fs.promises.writeFile(filePath, content);
  }
}

export function getFileUrl(
  filePath: string,
  options?: {
    fileServerURLPrefix?: string | undefined;
  },
): string {
  const fileServerURLPrefix =
    options?.fileServerURLPrefix || process.env.FILESERVER_URL_PREFIX;

  if (!fileServerURLPrefix) {
    throw new Error(
      "To get a file URL, please provide a fileServerURLPrefix or set FILESERVER_URL_PREFIX environment variable.",
    );
  }

  return `${fileServerURLPrefix}/${filePath}`;
}
