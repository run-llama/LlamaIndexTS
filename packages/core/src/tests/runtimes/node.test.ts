import execa from "execa";
import { createFixture } from "fs-fixture";

describe("Node: System", () => {
  test("ESM", async () => {
    const fixture = await createFixture("./src/tests/fixtures/esm");

    await execa("npm", ["link", "llamaindex"], { cwd: fixture.path });

    const result = await execa("node", [fixture.path]);

    expect(result.stdout).toContain(
      "The author attended college but did not find it particularly interesting or relevant to their programming interests. They slacked off, skipped lectures, and eventually stopped attending altogether. They returned their Macbook and only went back to the college five years later to pick up their papers.",
    );

    await execa("npm", ["unlink", "llamaindex"], { cwd: fixture.path });
  }, 10000);

  test("CJS", async () => {
    const fixture = await createFixture("./src/tests/fixtures/cjs");

    await execa("npm", ["link", "llamaindex"], { cwd: fixture.path });

    const result = await execa("node", [fixture.path]);

    expect(result.stdout).toContain(
      "The author attended college but did not find it particularly interesting or relevant to their programming interests. They slacked off, skipped lectures, and eventually stopped attending altogether. They returned their Macbook and only went back to the college five years later to pick up their papers.",
    );

    await execa("npm", ["unlink", "llamaindex"], { cwd: fixture.path });
  }, 10000);
});
