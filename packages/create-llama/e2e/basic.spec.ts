/* eslint-disable turbo/no-undeclared-env-vars */
import { expect, test } from "@playwright/test";
import { ChildProcess, exec } from "child_process";
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import waitPort from "wait-port";
import type {
  TemplateEngine,
  TemplateFramework,
  TemplateType,
  TemplateUI,
} from "../templates";

let cwd: string;
test.beforeEach(async () => {
  cwd = fileURLToPath(
    new URL(`.cache/${crypto.randomUUID()}`, import.meta.url),
  );
  await mkdir(cwd, { recursive: true });
});

type AppType = "--frontend" | "--no-frontend" | "";

const templateTypes: TemplateType[] = ["streaming"];
const templateFrameworks: TemplateFramework[] = ["express"];
const templateEngines: TemplateEngine[] = ["simple"];
const templateUIs: TemplateUI[] = ["html"];
const MODEL = "gpt-3.5-turbo";

for (const templateType of templateTypes) {
  for (const templateFramework of templateFrameworks) {
    for (const templateEngine of templateEngines) {
      for (const templateUI of templateUIs) {
        const appType: AppType =
          templateFramework === "express" || templateFramework === "fastapi"
            ? "--frontend"
            : "";
        if (templateEngine === "context") {
          // we don't test context templates because it needs OPEN_AI_KEY
          continue;
        }
        test(`try create-llama ${templateType} ${templateFramework} ${templateEngine} ${templateUI} ${appType}`, async ({
          page,
        }) => {
          const name = runCreateLlama(
            templateType,
            templateFramework,
            templateEngine,
            templateUI,
            appType,
          );

          const port = Math.floor(Math.random() * 10000) + 10000;
          const cps = await runApp(name, appType, port);

          // test frontend
          await page.goto(`http://localhost:${port}`);
          await expect(page.getByText("Built by LlamaIndex")).toBeVisible();
          // TODO: test backend using curl (would need OpenAI key)
          // clean processes
          cps.forEach((cp) => cp.kill());
        });
      }
    }
  }
}

async function runApp(
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

function runCreateLlama(
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
    "testKey", // TODO: pass in OPEN_AI_KEY from CI env if needed for tests
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
