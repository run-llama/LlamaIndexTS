import { createHash, randomUUID } from "node:crypto";
import { EOL } from "node:os";

export { randomUUID };

export { dirname, join } from "node:path";

export const createSHA256 = () => {
  return createHash("sha256");
};

export async function fileTypeFromBuffer(buffer: Buffer) {
  const { fileTypeFromBuffer } = await import("file-type")
  return fileTypeFromBuffer(buffer);
}

export { EOL };
