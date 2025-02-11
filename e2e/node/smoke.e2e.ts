import { execSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";
import { testRootDir } from "./utils.js";

await test("cjs/esm dual module check", async (t) => {
  const esmImports = `import fs from 'node:fs/promises'
import { Document, MetadataMode, NodeWithScore, VectorStoreIndex } from 'llamaindex'
import { OpenAIEmbedding } from '@llamaindex/openai'
import { Settings } from '@llamaindex/core/global'`;
  const cjsRequire = `const fs = require('fs').promises
const { Document, MetadataMode, NodeWithScore, VectorStoreIndex } = require('llamaindex')
const { OpenAIEmbedding } = require('@llamaindex/openai')
const { Settings } = require('@llamaindex/core/global')`;
  const mainCode = `
async function main() {
  const descriptor = Object.getOwnPropertyDescriptor(Settings, 'embedModel')
  Settings.embedModel = new OpenAIEmbedding({
    model: 'text-embedding-3-small',
    apiKey: '${process.env.OPENAI_API_KEY}',
  })
  const model = Settings.embedModel
  if (model == null) {
    process.exit(-1)
  }
}
main().catch(console.error)`;
  t.before(async () => {
    await mkdir(resolve(testRootDir, ".temp"), {
      recursive: true,
      mode: 0o755,
    });
  });

  t.after(async () => {
    await rm(resolve(testRootDir, ".temp"), {
      recursive: true,
      force: true,
    });
  });

  await t.test("cjs", async () => {
    const cjsCode = `${cjsRequire}\n${mainCode}`;
    const filePath = resolve(
      testRootDir,
      ".temp",
      `${crypto.randomUUID()}.cjs`,
    );
    await writeFile(filePath, cjsCode, "utf-8");

    execSync(`${process.argv[0]} ${filePath}`, {
      cwd: process.cwd(),
    });
  });

  await t.test("esm", async () => {
    const esmCode = `${esmImports}\n${mainCode}`;
    const filePath = resolve(
      testRootDir,
      ".temp",
      `${crypto.randomUUID()}.mjs`,
    );
    await writeFile(filePath, esmCode, "utf-8");

    execSync(`${process.argv[0]} ${filePath}`, {
      cwd: process.cwd(),
    });
  });
});
