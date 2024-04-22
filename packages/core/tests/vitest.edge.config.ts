import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
