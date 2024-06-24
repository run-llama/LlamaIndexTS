import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/llm/bedrock/base.ts"],
    format: ["cjs", "esm"],
    sourcemap: true,
  },
]);
