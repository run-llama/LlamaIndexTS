import { copy } from "../helpers/copy";
import { install } from "../helpers/install";

import fs from "fs/promises";
import os from "os";
import path from "path";
import { bold, cyan } from "picocolors";
import { version } from "../package.json";

import { InstallPythonTemplateArgs, InstallTemplateArgs } from "./types";

/**
 * Install a LlamaIndex internal template to a given `root` directory.
 */
export const installTemplate = async ({
  appName,
  root,
  packageManager,
  isOnline,
  template,
  framework,
  engine,
  ui,
  eslint,
}: InstallTemplateArgs) => {
  console.log(bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, template, framework);
  const copySource = ["**"];
  if (!eslint) copySource.push("!eslintrc.json");

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case "gitignore":
        case "eslintrc.json": {
          return `.${name}`;
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  /**
   * Copy the selected chat engine files to the target directory and reference it.
   */
  let relativeEngineDestPath;
  if (framework === "express" || framework === "nextjs") {
    console.log("\nUsing chat engine:", engine, "\n");
    const enginePath = path.join(__dirname, "engines", engine);
    relativeEngineDestPath =
      framework === "nextjs"
        ? path.join("app", "api", "chat")
        : path.join("src", "controllers");
    await copy("**", path.join(root, relativeEngineDestPath, "engine"), {
      parents: true,
      cwd: enginePath,
    });
    const routeFile = path.join(
      root,
      relativeEngineDestPath,
      framework === "nextjs" ? "route.ts" : "chat.controller.ts",
    );
    const routeFileContent = await fs.readFile(routeFile, "utf8");
    const newContent = routeFileContent.replace(
      /^import { createChatEngine }.*$/m,
      'import { createChatEngine } from "./engine"\n',
    );
    await fs.writeFile(routeFile, newContent);
  }

  /**
   * Copy the selected UI files to the target directory and reference it.
   */
  if (framework === "nextjs") {
    console.log("\nUsing UI:", ui, "\n");
    const uiPath = path.join(__dirname, "ui", ui);
    const componentsPath = path.join("app", "components");
    await copy("**", path.join(root, componentsPath, "ui"), {
      parents: true,
      cwd: uiPath,
    });
    const chatSectionFile = path.join(root, componentsPath, "chat-section.tsx");
    const chatSectionFileContent = await fs.readFile(chatSectionFile, "utf8");
    const newContent = chatSectionFileContent.replace(
      /^import { ChatInput, ChatMessages, Message }.*$/m,
      'import { ChatInput, ChatMessages, Message } from "./ui/chat"\n',
    );
    await fs.writeFile(chatSectionFile, newContent);
  }

  /**
   * Update the package.json scripts.
   */
  const packageJsonFile = path.join(root, "package.json");
  const packageJson: any = JSON.parse(
    await fs.readFile(packageJsonFile, "utf8"),
  );
  packageJson.name = appName;
  packageJson.version = "0.1.0";

  packageJson.dependencies = {
    ...packageJson.dependencies,
    llamaindex: version,
  };

  if (engine === "context" && relativeEngineDestPath) {
    // add generate script if using context engine
    packageJson.scripts = {
      ...packageJson.scripts,
      generate: `node ${path.join(
        relativeEngineDestPath,
        "engine",
        "generate.mjs",
      )}`,
    };
  }

  if (framework === "nextjs" && ui === "shadcn") {
    // add shadcn dependencies to package.json
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "tailwind-merge": "^2",
      "@radix-ui/react-slot": "^1",
      "class-variance-authority": "^0.7",
      "lucide-react": "^0.291",
    };
  }

  if (!eslint) {
    // Remove packages starting with "eslint" from devDependencies
    packageJson.devDependencies = Object.fromEntries(
      Object.entries(packageJson.devDependencies).filter(
        ([key]) => !key.startsWith("eslint"),
      ),
    );
  }
  await fs.writeFile(
    packageJsonFile,
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  console.log("\nInstalling dependencies:");
  for (const dependency in packageJson.dependencies)
    console.log(`- ${cyan(dependency)}`);

  console.log("\nInstalling devDependencies:");
  for (const dependency in packageJson.devDependencies)
    console.log(`- ${cyan(dependency)}`);

  console.log();

  await install(packageManager, isOnline);
};

export const installPythonTemplate = async ({
  appName,
  root,
  template,
  framework,
}: InstallPythonTemplateArgs) => {
  console.log("\nInitializing Python project with template:", template, "\n");
  const templatePath = path.join(__dirname, template, framework);
  await copy("**", root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case "gitignore": {
          return `.${name}`;
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });
  console.log(
    "\nPython project, dependencies won't be installed automatically.\n",
  );
};

export * from "./types";
