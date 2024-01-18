import { createHash, randomUUID } from "node:crypto";
import { EOL } from "node:os";

export { randomUUID };

export { dirname, join } from "node:path";

export const createSHA256 = () => {
  return createHash("sha256");
};

export { fileTypeFromBuffer } from "file-type";

export { EOL };
