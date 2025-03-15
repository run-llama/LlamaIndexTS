// @ts-check

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    name: "eslint-config-turbo (recreated flat)",
    plugins: {
      turbo: { rules: turboPlugin.rules },
    },
  },
  {
    rules: {
      "no-irregular-whitespace": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          ignoreRestArgs: true,
        },
      ],
    },
  },
  {
    files: ["packages/wasm-tools/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: [
      "**/dist/**",
      "**/lib/*",
      "**/deps/**",
      "**/.next/**",
      "**/.source/**",  // Ignore .source directories
      "!.git",  // Don't ignore .git directory
      "**/.*",  // Ignore all dot files and directories
      "**/node_modules/**",
      "**/build/**",
      "**/.docusaurus/**",
      // third party deps
      "packages/env/src/fs/memfs/index.js",
      "packages/core/src/prompts/format.ts",
      "packages/core/src/node-parser/sentence_tokenizer.js",
    ],
  },
);
