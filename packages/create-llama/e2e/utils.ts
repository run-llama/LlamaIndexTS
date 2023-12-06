import { ChildProcess, exec, execSync } from "child_process";
import crypto from "node:crypto";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import waitPort from "wait-port";

export type AppType = "--frontend" | "--no-frontend" | "";
const MODEL = "gpt-3.5-turbo";

export async function runApp(
  cwd: string,
  name: string,
  appType: AppType,
  port: number,
): Promise<ChildProcess[]> {
  const cps = [];

  try {
    switch (appType) {
      case "--no-frontend":
        cps.push(
          await createProcess("npm run dev", `${cwd}/${name}/backend`, port),
        );
        break;
      case "--frontend":
        cps.push(
          await createProcess(
            "npm run dev",
            `${cwd}/${name}/backend`,
            port + 1,
          ),
        );
        cps.push(
          await createProcess("npm run dev", `${cwd}/${name}/frontend`, port),
        );
        break;
      default:
        cps.push(await createProcess("npm run dev", `${cwd}/${name}`, port));
        break;
    }
  } catch (e) {
    cps.forEach((cp) => cp.kill());
    throw e;
  }
  return cps;
}

async function createProcess(command: string, cwd: string, port: number) {
  const cp = exec(command, {
    cwd,
    env: {
      ...process.env,
      PORT: `${port}`,
    },
  });
  if (!cp) throw new Error(`Can't start process ${command} in ${cwd}`);

  await waitPort({
    host: "localhost",
    port,
    timeout: 1000 * 60,
  });
  return cp;
}

export function runCreateLlama(
  cwd: string,
  templateType: string,
  templateFramework: string,
  templateEngine: string,
  templateUI: string,
  appType: AppType,
) {
  const createLlama = fileURLToPath(
    new URL("../dist/index.js", import.meta.url),
  );

  const name = [
    templateType,
    templateFramework,
    templateEngine,
    templateUI,
    appType,
  ].join("-");
  const command = [
    "node",
    createLlama,
    name,
    "--template",
    templateType,
    "--framework",
    templateFramework,
    "--engine",
    templateEngine,
    "--ui",
    templateUI,
    "--model",
    MODEL,
    "--open-ai-key",
    "testKey",
    appType,
    "--eslint",
    "--use-npm",
  ].join(" ");
  console.log(`running command '${command}' in ${cwd}`);
  execSync(command, {
    stdio: "inherit",
    cwd,
  });
  return name;
}
export async function createTestDir() {
  const cwd = fileURLToPath(
    new URL(`.cache/${crypto.randomUUID()}`, import.meta.url),
  );
  await mkdir(cwd, { recursive: true });
  return cwd;
}
