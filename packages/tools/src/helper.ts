import fs from "node:fs";
import path from "node:path";

export async function saveDocument(filepath: string, content: string | Buffer) {
  if (path.isAbsolute(filepath)) {
    throw new Error("Absolute file paths are not allowed.");
  }
  if (!process.env.FILESERVER_URL_PREFIX) {
    throw new Error("FILESERVER_URL_PREFIX environment variable is not set.");
  }

  const dirPath = path.dirname(filepath);
  await fs.promises.mkdir(dirPath, { recursive: true });

  if (typeof content === "string") {
    await fs.promises.writeFile(filepath, content, "utf-8");
  } else {
    await fs.promises.writeFile(filepath, content);
  }

  const fileurl = `${process.env.FILESERVER_URL_PREFIX}/${filepath}`;
  console.log(`Saved document to ${filepath}. Reachable at URL: ${fileurl}`);
  return fileurl;
}
