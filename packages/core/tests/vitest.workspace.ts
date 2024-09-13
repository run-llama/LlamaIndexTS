import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      environment: "edge-runtime",
    },
  },
  {
    test: {
      environment: "happy-dom",
    },
  },
  {
    test: {
      environment: "node",
    },
  },
]);
