import assert from "node:assert";
import { execSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { test } from "node:test";
import { testRootDir } from "./utils.js";

await test("cjs/esm dual module check", async (t) => {
  const esmImports = `import fs from 'node:fs/promises'
import { Document, MetadataMode, VectorStoreIndex } from 'llamaindex'
import { OpenAIEmbedding } from '@llamaindex/openai'
import { Settings } from '@llamaindex/core/global'`;
  const cjsRequire = `const fs = require('fs').promises
const { Document, MetadataMode, VectorStoreIndex } = require('llamaindex')
const { OpenAIEmbedding } = require('@llamaindex/openai')
const { Settings } = require('@llamaindex/core/global')`;
  const mainCode = `
Settings.embedModel = new OpenAIEmbedding({
  model: 'text-embedding-3-small',
  apiKey: '${process.env.OPENAI_API_KEY}',
})
const model = Settings.embedModel
if (model == null) {
  process.exit(-1)
}
const document = new Document({ text: 'Hello, world!' })
const index = await VectorStoreIndex.fromDocuments([document])
`;
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

  const specialConditions = ["edge-light", "workerd", "react-server"];
  for (const condition of specialConditions) {
    await t.test(condition, async () => {
      const esmCode = `${esmImports}\n${mainCode}`;
      const filePath = resolve(
        testRootDir,
        ".temp",
        `${crypto.randomUUID()}.mjs`,
      );
      await writeFile(filePath, esmCode, "utf-8");

      execSync(`${process.argv[0]} ${filePath} -C ${condition}`, {
        cwd: process.cwd(),
      });
    });
  }
});

test('no extra deps in "@llamaindex/env" cjs module', async () => {
  const modules = ["@aws-crypto/sha256-js"];
  const require = createRequire(import.meta.url);
  const envPackage = require.resolve("@llamaindex/env");
  const file = await readFile(envPackage, "utf-8");
  for (const module of modules) {
    assert.ok(!file.includes(module));
  }
});

test('no error when require "llamaindex" in CJS', async () => {
  const code = `require('llamaindex')`;
  execSync(`${process.argv[0]} -e "${code}"`, {
    cwd: process.cwd(),
  });
});
