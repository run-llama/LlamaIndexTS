import execa, { ExecaChildProcess } from "execa";
import { createFixture, FsFixture } from "fs-fixture";
import getPort from "get-port";
import terminate from "terminate";

describe("Next App Router", () => {
  let port: number;
  let fixture: FsFixture;
  let server: ExecaChildProcess;

  beforeAll(async () => {
    port = await getPort();
    fixture = await createFixture("./src/tests/fixtures/next-app");

    await execa("npm", ["link", "llamaindex"], { cwd: fixture.path });

    server = execa("npm", ["run", "dev", "--", `--port=${port}`], {
      cwd: fixture.path,
    });

    server.stderr?.on("data", (data) => {
      console.log(data.toString());
    });

    await new Promise<void>((resolve) => {
      server.stdout?.on("data", (data) => {
        if (data.toString().includes("Ready")) {
          resolve();
        }
      });
    });
  }, 20000);

  afterAll(async () => {
    await terminate(server.pid!);

    await execa("npm", ["unlink", "llamaindex"], { cwd: fixture.path });
    await fixture.rm();
  });

  test("Node Runtime", async () => {
    const response = await fetch(`http://localhost:${port}/api/node-runtime`);
    const result = await response.json();

    for (const [assertion, value] of Object.entries(result.assertions)) {
      expect({ assertion, value }).toStrictEqual({ assertion, value: true });
    }
    expect(result.status).toBe("success");
  });
});
