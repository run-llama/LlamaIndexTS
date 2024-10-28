import { register } from "node:module";
import { fileURLToPath } from "node:url";

register("./hook.js", {
  parentURL: import.meta.url,
  data: {
    packageDir: fileURLToPath(new URL("../../", import.meta.url)),
  },
});
