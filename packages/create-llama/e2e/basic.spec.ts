/* eslint-disable turbo/no-undeclared-env-vars */
import { expect, test } from "@playwright/test";
import { exec } from "child_process";
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

const templateTypes: TemplateType[] = ["streaming", "simple"];
const templateFrameworks: TemplateFramework[] = ["nextjs", "express"];
const templateEngines: TemplateEngine[] = ["simple", "context"];
const templateUIs: TemplateUI[] = ["shadcn", "html"];

for (const templateType of templateTypes) {
  for (const templateFramework of templateFrameworks) {
    for (const templateEngine of templateEngines) {
      for (const templateUI of templateUIs) {
        const shouldGenerateFrontendEnum =
          templateFramework === "express" || templateFramework === "fastapi"
            ? ["--frontend", "--no-frontend"]
            : [""];
        for (const shouldGenerateFrontend of shouldGenerateFrontendEnum) {
          if (templateEngine === "context") {
            // we don't test context templates because it needs OPEN_AI_KEY
            continue;
          }
          test(`try create-llama ${templateType} ${templateFramework} ${templateEngine} ${templateUI} ${shouldGenerateFrontend}`, async ({
            page,
          }) => {
            const createLlama = fileURLToPath(
              new URL("../dist/index.js", import.meta.url),
            );

            const name = [
              templateType,
              templateFramework,
              templateEngine,
              templateUI,
              shouldGenerateFrontend,
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
              "--open-ai-key",
              process.env.OPEN_AI_KEY || "",
              shouldGenerateFrontend,
              "--eslint",
            ].join(" ");
            console.log(`running command '${command}' in ${cwd}`);
            execSync(command, {
              stdio: "inherit",
              cwd,
            });

            const port = Math.floor(Math.random() * 10000) + 10000;

            if (
              shouldGenerateFrontend === "--frontend" &&
              templateFramework === "express"
            ) {
              execSync("npm install", {
                stdio: "inherit",
                cwd: `${cwd}/${name}/frontend`,
              });
              execSync("npm install", {
                stdio: "inherit",
                cwd: `${cwd}/${name}/backend`,
              });
            } else {
              execSync("npm install", {
                stdio: "inherit",
                cwd: `${cwd}/${name}`,
              });
            }

            if (shouldGenerateFrontend === "--no-frontend") {
              return;
            }

            const cp = exec("npm run dev", {
              cwd:
                shouldGenerateFrontend === "--frontend"
                  ? `${cwd}/${name}/frontend`
                  : `${cwd}/${name}`,
              env: {
                ...process.env,
                PORT: `${port}`,
              },
            });

            await waitPort({
              host: "localhost",
              port,
              timeout: 1000 * 60,
            });

            await page.goto(`http://localhost:${port}`);
            await expect(page.getByText("Built by LlamaIndex")).toBeVisible();
            cp.kill();
          });
        }
      }
    }
  }
}
