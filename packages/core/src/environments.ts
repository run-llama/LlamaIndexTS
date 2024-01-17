import { createHash } from "node:crypto";
import { EOL } from "node:os";

export const createSHA256 = () => {
  return createHash("sha256");
};

export { EOL };
