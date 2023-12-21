/* eslint-disable turbo/no-undeclared-env-vars */
import { expect, test } from "@playwright/test";
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
        test(`try create-llama ${templateType} ${templateFramework} ${templateEngine} ${templateUI} ${appType}`, async ({
          page,
        }) => {
          const port = Math.floor(Math.random() * 10000) + 10000;
          const externalPort = port + 1;

          const cwd = await createTestDir();
          const name = runCreateLlama(
            cwd,
            templateType,
            templateFramework,
            templateEngine,
            templateUI,
            appType,
            externalPort,
          );

          const cps = await runApp(cwd, name, appType, port, externalPort);

          // test frontend
          if (appType !== "--no-frontend") {
            await page.goto(`http://localhost:${port}`);
            await expect(page.getByText("Built by LlamaIndex")).toBeVisible();

            // test submit a message and check if having successful response from /api/chat endpoint
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
            console.log(text);
            expect(response.ok()).toBeTruthy();
          }
          // TODO: test backend using curl (would need OpenAI key)
          // clean processes
          cps.forEach((cp) => cp.kill());
        });
      }
    }
  }
}
