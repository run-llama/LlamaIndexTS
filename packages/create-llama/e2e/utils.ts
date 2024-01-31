import { ChildProcess, exec } from "child_process";
import crypto from "node:crypto";
import { mkdir } from "node:fs/promises";
import * as path from "path";
import waitPort from "wait-port";
import {
  TemplateEngine,
  TemplateFramework,
  TemplatePostInstallAction,
  TemplateType,
  TemplateUI,
} from "../helpers";

export type AppType = "--frontend" | "--no-frontend" | "";
const MODEL = "gpt-3.5-turbo";
export type CreateLlamaResult = {
  projectName: string;
  appProcess: ChildProcess;
};

// eslint-disable-next-line max-params
export async function checkAppHasStarted(
  frontend: boolean,
  framework: TemplateFramework,
  port: number,
  externalPort: number,
  timeout: number,
) {
  if (frontend) {
    await Promise.all([
      waitPort({
        host: "localhost",
        port: port,
        timeout,
      }),
      waitPort({
        host: "localhost",
        port: externalPort,
        timeout,
      }),
    ]).catch((err) => {
      console.error(err);
      throw err;
    });
  } else {
    let wPort: number;
    if (framework === "nextjs") {
      wPort = port;
    } else {
      wPort = externalPort;
    }
    await waitPort({
      host: "localhost",
      port: wPort,
      timeout,
    }).catch((err) => {
      console.error(err);
      throw err;
    });
  }
}

// eslint-disable-next-line max-params
export async function runCreateLlama(
  cwd: string,
  templateType: TemplateType,
  templateFramework: TemplateFramework,
  templateEngine: TemplateEngine,
  templateUI: TemplateUI,
  appType: AppType,
  port: number,
  externalPort: number,
  postInstallAction: TemplatePostInstallAction,
): Promise<CreateLlamaResult> {
  const createLlama = path.join(
    __dirname,
    "..",
    "output",
    "package",
    "dist",
    "index.js",
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
    process.env.OPENAI_API_KEY || "testKey",
    appType,
    "--eslint",
    "--use-npm",
    "--port",
    port,
    "--external-port",
    externalPort,
    "--post-install-action",
    postInstallAction,
  ].join(" ");
  console.log(`running command '${command}' in ${cwd}`);
  let appProcess = exec(command, {
    cwd,
    env: {
      ...process.env,
    },
  });
  appProcess.stderr?.on("data", (data) => {
    console.log(data.toString());
  });
  appProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      throw new Error(`create-llama command was failed!`);
    }
  });

  // Wait for app to start
  if (postInstallAction === "runApp") {
    await checkAppHasStarted(
      appType === "--frontend",
      templateFramework,
      port,
      externalPort,
      1000 * 60 * 5,
    );
  }

  return {
    projectName: name,
    appProcess,
  };
}

export async function createTestDir() {
  const cwd = path.join(__dirname, ".cache", crypto.randomUUID());
  await mkdir(cwd, { recursive: true });
  return cwd;
}
