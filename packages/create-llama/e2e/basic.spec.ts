/* eslint-disable turbo/no-undeclared-env-vars */
import { expect, test } from "@playwright/test";
import { ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import type {
  TemplateEngine,
  TemplateFramework,
  TemplatePostInstallAction,
  TemplateType,
  TemplateUI,
} from "../helpers";
import { createTestDir, runCreateLlama, type AppType } from "./utils";

const templateTypes: TemplateType[] = ["streaming", "simple"];
const templateFrameworks: TemplateFramework[] = [
  "nextjs",
  "express",
  "fastapi",
];
const templateEngines: TemplateEngine[] = ["simple", "context"];
const templateUIs: TemplateUI[] = ["shadcn", "html"];
const templatePostInstallActions: TemplatePostInstallAction[] = [
  "none",
  "runApp",
];

for (const templateType of templateTypes) {
  for (const templateFramework of templateFrameworks) {
    for (const templateEngine of templateEngines) {
      for (const templateUI of templateUIs) {
        for (const templatePostInstallAction of templatePostInstallActions) {
          if (templateFramework === "nextjs" && templateType === "simple") {
            // nextjs doesn't support simple templates - skip tests
            continue;
          }
          const appType: AppType =
            templateFramework === "express" || templateFramework === "fastapi"
              ? templateType === "simple"
                ? "--no-frontend" // simple templates don't have frontends
                : "--frontend"
              : "";
          if (appType === "--no-frontend" && templateUI !== "html") {
            // if there's no frontend, don't iterate over UIs
            continue;
          }
          test.describe(`try create-llama ${templateType} ${templateFramework} ${templateEngine} ${templateUI} ${appType} ${templatePostInstallAction}`, async () => {
            let port: number;
            let externalPort: number;
            let cwd: string;
            let name: string;
            let appProcess: ChildProcess;
            // Only test without using vector db for now
            const vectorDb = "none";

            test.beforeAll(async () => {
              port = Math.floor(Math.random() * 10000) + 10000;
              externalPort = port + 1;
              cwd = await createTestDir();
              const result = await runCreateLlama(
                cwd,
                templateType,
                templateFramework,
                templateEngine,
                templateUI,
                vectorDb,
                appType,
                port,
                externalPort,
                templatePostInstallAction,
              );
              name = result.projectName;
              appProcess = result.appProcess;
            });

            test("App folder should exist", async () => {
              const dirExists = fs.existsSync(path.join(cwd, name));
              expect(dirExists).toBeTruthy();
            });
            test("Frontend should have a title", async ({ page }) => {
              test.skip(templatePostInstallAction !== "runApp");
              test.skip(appType === "--no-frontend");
              await page.goto(`http://localhost:${port}`);
              await expect(page.getByText("Built by LlamaIndex")).toBeVisible();
            });

            test("Frontend should be able to submit a message and receive a response", async ({
              page,
            }) => {
              test.skip(templatePostInstallAction !== "runApp");
              test.skip(appType === "--no-frontend");
              await page.goto(`http://localhost:${port}`);
              await page.fill("form input", "hello");
              await page.click("form button[type=submit]");
              const response = await page.waitForResponse(
                (res) => {
                  return (
                    res.url().includes("/api/chat") && res.status() === 200
                  );
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
              test.skip(templatePostInstallAction !== "runApp");
              test.skip(appType !== "--no-frontend");
              const backendPort = appType === "" ? port : externalPort;
              const response = await request.post(
                `http://localhost:${backendPort}/api/chat`,
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
              appProcess?.kill();
            });
          });
        }
      }
    }
  }
}
