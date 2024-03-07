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

  if (frontend) {
    devcontainerJson.postCreateCommand =
      framework === "fastapi"
        ? "cd backend && poetry install && cd ../frontend && npm install"
        : "cd backend && npm install && cd ../frontend && npm install";
  } else {
    devcontainerJson.postCreateCommand =
      framework === "fastapi" ? "poetry install" : "npm install";
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
