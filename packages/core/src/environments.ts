import { createHash, randomUUID } from "node:crypto";
import { EOL } from "node:os";

export { randomUUID };

export const createSHA256 = () => {
  return createHash("sha256");
};

export { EOL };
