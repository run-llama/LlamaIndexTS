import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/*.int.test.ts", "**/dist/**"],
  },
});
