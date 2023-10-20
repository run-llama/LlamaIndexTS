import execa, { ExecaChildProcess } from "execa";
import { FsFixture, createFixture } from "fs-fixture";
import getPort from "get-port";

describe("Next App Router", () => {
  let port: number;
  let fixture: FsFixture;
  let server: ExecaChildProcess;

  beforeAll(async () => {
    port = await getPort();
    fixture = await createFixture("./src/tests/fixtures/next-app");

    // await execa("npm", ["link", "llamaindex"], { cwd: fixture.path });

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
  }, 10000);

  afterAll(async () => {
    server.kill();

    // await execa("npm", ["unlink", "llamaindex"], { cwd: fixture.path });
  });

  test("Node Runtime", async () => {
    const response = await fetch(`http://localhost:${port}/api/node-runtime`);
    expect(await response.json()).toEqual(
      "The author attended college but did not find it particularly interesting or relevant to their programming interests. They slacked off, skipped lectures, and eventually stopped attending altogether. They returned their Macbook and only went back to the college five years later to pick up their papers.",
    );
  }, 20000);
});
