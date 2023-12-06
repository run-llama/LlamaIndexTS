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
          const cwd = await createTestDir();
          const name = runCreateLlama(
            cwd,
            templateType,
            templateFramework,
            templateEngine,
            templateUI,
            appType,
          );

          const port = Math.floor(Math.random() * 10000) + 10000;
          const cps = await runApp(cwd, name, appType, port);

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
