import { LlamaParseReader } from "llamaindex";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const fixturesDir = fileURLToPath(new URL("./fixtures", import.meta.url));

test("file type should be detected correctly", async () => {
  const xlsx = join(fixturesDir, "test.xlsx");
  const buffer = await readFile(xlsx);
  const { mime, extension } = await LlamaParseReader.getMimeType(buffer);
  expect(mime).toBe("application/vnd.oasis.opendocument.spreadsheet");
  expect(extension).toBe("ods");
});
