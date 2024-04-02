import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

// pg vector store should import successfully, but throw an error when connecting to the database
describe("import compatibility: https://github.com/run-llama/LlamaIndexTS/pull/685", async () => {
  const dir = fileURLToPath(new URL("./fixtures", import.meta.url));
  test("pg.cjs", () => {
    const { stderr } = spawnSync("node", [join(dir, "pg.cjs")], {
      encoding: "utf8",
    });
    expect(stderr).toMatch(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string",
    );
  });
  test("pg.mjs", () => {
    const { stderr } = spawnSync("node", [join(dir, "pg.mjs")], {
      encoding: "utf8",
    });
    expect(stderr).toMatch(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string",
    );
  });
});
