import fs from "fs/promises";
import os from "os";
import path from "path";
import { bold, cyan } from "picocolors";
import { version } from "../../core/package.json";
import { copy } from "../helpers/copy";
import { callPackageManager } from "../helpers/install";
import { InstallTemplateArgs } from "./types";

const rename = (name: string) => {
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
};
/**
 * Install a LlamaIndex internal template to a given `root` directory.
 */
export const installTSTemplate = async ({
  appName,
  root,
  packageManager,
  isOnline,
  template,
  framework,
  engine,
  ui,
  eslint,
  customApiPath,
  forBackend,
  vectorDb,
}: InstallTemplateArgs) => {
  console.log(bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, "types", template, framework);
  const copySource = ["**"];
  if (!eslint) copySource.push("!eslintrc.json");

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename,
  });

  /**
   * If the backend is next.js, rename next.config.app.js to next.config.js
   * If not, rename next.config.static.js to next.config.js
   */
  if (framework == "nextjs" && forBackend === "nextjs") {
    const nextConfigAppPath = path.join(root, "next.config.app.js");
    const nextConfigPath = path.join(root, "next.config.js");
    await fs.rename(nextConfigAppPath, nextConfigPath);
    // delete next.config.static.js
    const nextConfigStaticPath = path.join(root, "next.config.static.js");
    await fs.rm(nextConfigStaticPath);
  } else if (framework == "nextjs" && typeof forBackend === "undefined") {
    const nextConfigStaticPath = path.join(root, "next.config.static.js");
    const nextConfigPath = path.join(root, "next.config.js");
    await fs.rename(nextConfigStaticPath, nextConfigPath);
    // delete next.config.app.js
    const nextConfigAppPath = path.join(root, "next.config.app.js");
    await fs.rm(nextConfigAppPath);
  }

  /**
   * Copy the selected chat engine files to the target directory and reference it.
   */
  let relativeEngineDestPath;
  const compPath = path.join(__dirname, "components");
  if (engine && (framework === "express" || framework === "nextjs")) {
    console.log("\nUsing chat engine:", engine, "\n");

    let vectorDBFolder: string = engine;

    if (engine !== "simple" && vectorDb) {
      console.log("\nUsing vector DB:", vectorDb, "\n");
      vectorDBFolder = vectorDb;
    }

    const VectorDBPath = path.join(
      compPath,
      "vectordbs",
      "typescript",
      vectorDBFolder,
    );
    relativeEngineDestPath =
      framework === "nextjs"
        ? path.join("app", "api", "chat")
        : path.join("src", "controllers");
    await copy("**", path.join(root, relativeEngineDestPath, "engine"), {
      parents: true,
      cwd: VectorDBPath,
    });
  }

  /**
   * Copy the selected UI files to the target directory and reference it.
   */
  if (framework === "nextjs" && ui !== "shadcn") {
    console.log("\nUsing UI:", ui, "\n");
    const uiPath = path.join(compPath, "ui", ui);
    const destUiPath = path.join(root, "app", "components", "ui");
    // remove the default ui folder
    await fs.rm(destUiPath, { recursive: true });
    // copy the selected ui folder
    await copy("**", destUiPath, {
      parents: true,
      cwd: uiPath,
      rename,
    });
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

  if (framework === "nextjs" && customApiPath) {
    console.log(
      "\nUsing external API with custom API path:",
      customApiPath,
      "\n",
    );
    // remove the default api folder
    const apiPath = path.join(root, "app", "api");
    await fs.rm(apiPath, { recursive: true });
    // modify the dev script to use the custom api path
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: `cross-env NEXT_PUBLIC_CHAT_API=${customApiPath} next dev`,
    };
  }

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

  if (framework === "nextjs" && ui === "html") {
    // remove shadcn dependencies if html ui is selected
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "tailwind-merge": undefined,
      "@radix-ui/react-slot": undefined,
      "class-variance-authority": undefined,
      clsx: undefined,
      "lucide-react": undefined,
      remark: undefined,
      "remark-code-import": undefined,
      "remark-gfm": undefined,
      "remark-math": undefined,
      "react-markdown": undefined,
      "react-syntax-highlighter": undefined,
    };

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "@types/react-syntax-highlighter": undefined,
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

  await callPackageManager(packageManager, isOnline);
};
