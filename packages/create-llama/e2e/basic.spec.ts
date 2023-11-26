import { expect, test } from "@playwright/test";
import { exec } from "child_process";
import { execSync } from "node:child_process";
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

test("try create-llama", async ({ page }) => {
  const createLlama = fileURLToPath(
    new URL("../dist/index.js", import.meta.url),
  );

  const name = "basic";
  const template: TemplateType = "streaming";
  const framework: TemplateFramework = "nextjs";
  const engine: TemplateEngine = "simple";
  const ui: TemplateUI = "shadcn";

  const command = `node ${createLlama} ${name} --template ${template} --framework ${framework} --engine ${engine} --ui ${ui} --open-ai-key INVALID --eslint`;
  console.log(`running command '${command}' in ${cwd}`);

  execSync(command, {
    stdio: "inherit",
    cwd,
  });

  execSync("npm install", {
    stdio: "inherit",
    cwd: `${cwd}/${name}`,
  });

  const port = Math.floor(Math.random() * 10000) + 10000;

  const cp = exec("npm run dev", {
    cwd: `${cwd}/${name}`,
    env: {
      ...process.env,
      PORT: `${port}`,
    },
  });

  await waitPort({
    host: "localhost",
    port,
    timeout: 1000 * 60 * 5,
  });

  await page.goto(`http://localhost:${port}`);
  await expect(page.getByText("Built by LlamaIndex")).toBeVisible();
  cp.kill();
});
