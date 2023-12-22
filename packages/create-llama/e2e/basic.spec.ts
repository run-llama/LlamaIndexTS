/* eslint-disable turbo/no-undeclared-env-vars */
import { expect, test } from "@playwright/test";
import { ChildProcess } from "child_process";
import type {
  TemplateEngine,
  TemplateFramework,
  TemplateType,
  TemplateUI,
} from "../templates";
import { createTestDir, runApp, runCreateLlama, type AppType } from "./utils";

const templateTypes: TemplateType[] = ["streaming", "simple"];
const templateFrameworks: TemplateFramework[] = ["nextjs", "express"];
const templateEngines: TemplateEngine[] = ["simple", "context"];
const templateUIs: TemplateUI[] = ["shadcn", "html"];

for (const templateType of templateTypes) {
  for (const templateFramework of templateFrameworks) {
    for (const templateEngine of templateEngines) {
      for (const templateUI of templateUIs) {
        if (templateFramework === "nextjs" && templateType === "simple") {
          // nextjs doesn't support simple templates - skip tests
          continue;
        }
        if (templateEngine === "context") {
          // we don't test context templates because it needs OPEN_AI_KEY
          continue;
        }
        const appType: AppType =
          templateFramework === "express" || templateFramework === "fastapi"
            ? templateType === "simple"
              ? "--no-frontend" // simple templates don't have frontends
              : "--frontend"
            : "";
        test.describe(`try create-llama ${templateType} ${templateFramework} ${templateEngine} ${templateUI} ${appType}`, async () => {
          let port: number;
          let externalPort: number;
          let cwd: string;
          let name: string;
          let cps: ChildProcess[];

          test.beforeAll(async () => {
            port = Math.floor(Math.random() * 10000) + 10000;
            externalPort = port + 1;

            cwd = await createTestDir();
            name = runCreateLlama(
              cwd,
              templateType,
              templateFramework,
              templateEngine,
              templateUI,
              appType,
              externalPort,
            );

            cps = await runApp(cwd, name, appType, port, externalPort);
          });

          test("Frontend should have a title", async ({ page }) => {
            test.skip(appType === "--no-frontend");
            await page.goto(`http://localhost:${port}`);
            await expect(page.getByText("Built by LlamaIndex")).toBeVisible();
          });

          test("Frontend should be able to submit a message and receive a response", async ({
            page,
          }) => {
            test.skip(appType === "--no-frontend");
            await page.goto(`http://localhost:${port}`);
            await page.fill("form input", "hello");
            await page.click("form button[type=submit]");
            const response = await page.waitForResponse(
              (res) => {
                return res.url().includes("/api/chat") && res.status() === 200;
              },
              {
                timeout: 1000 * 60,
              },
            );
            const text = await response.text();
            console.log("AI response when submitting message: ", text);
            expect(response.ok()).toBeTruthy();
          });

          test("Backend should response when calling API", async ({
            request,
          }) => {
            test.skip(appType !== "--no-frontend");
            const response = await request.post(
              `http://localhost:${port}/api/chat`,
              {
                data: {
                  messages: [
                    {
                      role: "user",
                      content: "Hello",
                    },
                  ],
                },
              },
            );
            const text = await response.text();
            console.log("AI response when calling API: ", text);
            expect(response.ok()).toBeTruthy();
          });

          // clean processes
          test.afterAll(async () => {
            cps.map((cp) => cp.kill());
          });
        });
      }
    }
  }
}
