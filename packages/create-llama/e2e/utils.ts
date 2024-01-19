import { ChildProcess, exec, execSync } from "child_process";
import crypto from "node:crypto";
import { mkdir } from "node:fs/promises";
import * as path from "path";
import waitPort from "wait-port";
import { TemplateFramework } from "../helpers";

export type AppType = "--frontend" | "--no-frontend" | "";
const MODEL = "gpt-3.5-turbo";

export async function runApp(
  cwd: string,
  name: string,
  appType: AppType,
  framework: TemplateFramework,
  port: number,
  externalPort: number,
): Promise<ChildProcess[]> {
  const cps: ChildProcess[] = [];

  let backendCommand = "";
  if (framework === "fastapi") {
    backendCommand = `poetry run uvicorn main:app --host=0.0.0.0 --port=$PORT`;
  } else {
    backendCommand = "npm run dev";
  }

  try {
    switch (appType) {
      case "--frontend":
        cps.push(
          await createProcess(
            backendCommand,
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
          await createProcess(
            backendCommand,
            path.join(cwd, name),
            appType === "" ? port : externalPort,
          ),
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
  console.log(`running command '${command}' in ${cwd} port ${port}`);
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
  postInstallAction: string,
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
    "--post-install-action",
    postInstallAction,
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
