import execa from "execa";
import { createFixture } from "fs-fixture";

describe("Node: System", () => {
  test("ESM", async () => {
    const fixture = await createFixture("./src/tests/fixtures/esm");

    await execa("npm", ["link", "llamaindex"], { cwd: fixture.path });

    const response = await execa("node", [fixture.path]);
    const result = JSON.parse(response.stdout);

    for (const [assertion, value] of Object.entries(result.assertions)) {
      expect({ assertion, value }).toStrictEqual({ assertion, value: true });
    }
    expect(result.status).toBe("success");

    await execa("npm", ["unlink", "llamaindex"], { cwd: fixture.path });
    await fixture.rm();
  });

  test("CJS", async () => {
    const fixture = await createFixture("./src/tests/fixtures/cjs");

    await execa("npm", ["link", "llamaindex"], { cwd: fixture.path });

    const response = await execa("node", [fixture.path]);
    const result = JSON.parse(response.stdout);

    for (const [assertion, value] of Object.entries(result.assertions)) {
      expect({ assertion, value }).toStrictEqual({ assertion, value: true });
    }
    expect(result.status).toBe("success");

    await execa("npm", ["unlink", "llamaindex"], { cwd: fixture.path });
    await fixture.rm();
  });
});
