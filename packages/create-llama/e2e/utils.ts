import { ChildProcess, exec, execSync } from "child_process";
import crypto from "node:crypto";
import { mkdir } from "node:fs/promises";
import * as path from "path";
import waitPort from "wait-port";

export type AppType = "--frontend" | "--no-frontend" | "";
const MODEL = "gpt-3.5-turbo";

export async function runApp(
  cwd: string,
  name: string,
  appType: AppType,
  port: number,
  externalPort: number,
): Promise<ChildProcess[]> {
  const cps: ChildProcess[] = [];

  try {
    switch (appType) {
      case "--frontend":
        cps.push(
          await createProcess(
            "npm run dev",
            path.join(cwd, name, "backend"),
            externalPort,
          ),
        );
        cps.push(
          await createProcess(
            "npm run dev",
            path.join(cwd, name, "frontend"),
            port,
          ),
        );
        break;
      default:
        cps.push(
          await createProcess("npm run dev", path.join(cwd, name), port),
        );
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
  externalPort: number,
) {
  const createLlama = path.join(__dirname, "..", "dist", "index.js");

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
    process.env.OPENAI_API_KEY || "testKey",
    appType,
    "--eslint",
    "--use-npm",
    "--external-port",
    externalPort,
  ].join(" ");
  console.log(`running command '${command}' in ${cwd}`);
  execSync(command, {
    stdio: "inherit",
    cwd,
  });
  return name;
}
export async function createTestDir() {
  const cwd = path.join(__dirname, ".cache", crypto.randomUUID());
  await mkdir(cwd, { recursive: true });
  return cwd;
}
