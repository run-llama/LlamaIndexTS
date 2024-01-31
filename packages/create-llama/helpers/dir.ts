import path from "path";
import { fileURLToPath } from "url";

export const templatesDir = path.join(
  fileURLToPath(import.meta.url),
  "..",
  "..",
  "templates",
);
