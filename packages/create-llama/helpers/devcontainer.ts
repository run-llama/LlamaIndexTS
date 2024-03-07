import fs from "fs";
import path from "path";
import { TemplateFramework } from "./types";

function renderDevcontainerContent(
  templatesDir: string,
  framework: TemplateFramework,
  frontend: boolean,
) {
  const devcontainerJson: any = JSON.parse(
    fs.readFileSync(path.join(templatesDir, "devcontainer.json"), "utf8"),
  );

  // Modify postCreateCommand
  if (frontend) {
    devcontainerJson.postCreateCommand =
      framework === "fastapi"
        ? "cd backend && poetry install && cd ../frontend && npm install"
        : "cd backend && npm install && cd ../frontend && npm install";
  } else {
    devcontainerJson.postCreateCommand =
      framework === "fastapi" ? "poetry install" : "npm install";
  }

  // Modify containerEnv
  if (framework === "fastapi") {
    if (frontend) {
      devcontainerJson.containerEnv = {
        ...devcontainerJson.containerEnv,
        PYTHONPATH: "${PYTHONPATH}:${workspaceFolder}/backend",
      };
    } else {
      devcontainerJson.containerEnv = {
        ...devcontainerJson.containerEnv,
        PYTHONPATH: "${PYTHONPATH}:${workspaceFolder}",
      };
    }
  }

  return JSON.stringify(devcontainerJson, null, 2);
}

export const writeDevcontainer = async (
  root: string,
  templatesDir: string,
  framework: TemplateFramework,
  frontend: boolean,
) => {
  console.log("Adding .devcontainer");
  const devcontainerContent = renderDevcontainerContent(
    templatesDir,
    framework,
    frontend,
  );
  const devcontainerDir = path.join(root, ".devcontainer");
  fs.mkdirSync(devcontainerDir);
  await fs.promises.writeFile(
    path.join(devcontainerDir, "devcontainer.json"),
    devcontainerContent,
  );
};
