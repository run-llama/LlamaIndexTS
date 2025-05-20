import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json",
  output: "src/client",
  plugins: [
    ...defaultPlugins,
    "@hey-api/client-fetch",
    "zod",
    "@hey-api/schemas",
    "@hey-api/sdk",
    {
      enums: "javascript",
      identifierCase: "PascalCase",
      name: "@hey-api/typescript",
    },
  ],
});
