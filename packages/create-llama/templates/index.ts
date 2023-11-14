import { copy } from "../helpers/copy";
import { callPackageManager } from "../helpers/install";

import fs from "fs/promises";
import os from "os";
import path from "path";
import { bold, cyan } from "picocolors";
import { version } from "../../core/package.json";

import { PackageManager } from "../helpers/get-pkg-manager";
import {
  InstallTemplateArgs,
  TemplateEngine,
  TemplateFramework,
} from "./types";

const envFileNameMap: Record<TemplateFramework, string> = {
  nextjs: ".env.local",
  express: ".env",
  fastapi: ".env",
};

const createEnvLocalFile = async (
  root: string,
  framework: TemplateFramework,
  openAIKey?: string,
) => {
  if (openAIKey) {
    const envFileName = envFileNameMap[framework];
    if (!envFileName) return;
    await fs.writeFile(
      path.join(root, envFileName),
      `OPENAI_API_KEY=${openAIKey}\n`,
    );
    console.log(`Created '${envFileName}' file containing OPENAI_API_KEY`);
    process.env["OPENAI_API_KEY"] = openAIKey;
  }
};

const copyTestData = async (
  root: string,
  framework: TemplateFramework,
  packageManager?: PackageManager,
  engine?: TemplateEngine,
) => {
  if (engine === "context" || framework === "fastapi") {
    const srcPath = path.join(__dirname, "components", "data");
    const destPath = path.join(root, "data");
    console.log(`\nCopying test data to ${cyan(destPath)}\n`);
    await copy("**", destPath, {
      parents: true,
      cwd: srcPath,
    });
  }

  if (packageManager && engine === "context") {
    if (process.env["OPENAI_API_KEY"]) {
      console.log(
        `\nRunning ${cyan(
          `${packageManager} run generate`,
        )} to generate the context data.\n`,
      );
      await callPackageManager(packageManager, true, ["run", "generate"]);
      console.log();
    } else {
      console.log(
        `\nAfter setting your OpenAI key, run ${cyan(
          `${packageManager} run generate`,
        )} to generate the context data.\n`,
      );
    }
  }
};

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
const installTSTemplate = async ({
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
   * Copy the selected chat engine files to the target directory and reference it.
   */
  let relativeEngineDestPath;
  const compPath = path.join(__dirname, "components");
  if (engine && (framework === "express" || framework === "nextjs")) {
    console.log("\nUsing chat engine:", engine, "\n");
    const enginePath = path.join(compPath, "engines", engine);
    relativeEngineDestPath =
      framework === "nextjs"
        ? path.join("app", "api", "chat")
        : path.join("src", "controllers");
    await copy("**", path.join(root, relativeEngineDestPath, "engine"), {
      parents: true,
      cwd: enginePath,
    });
  }

  /**
   * Copy the selected UI files to the target directory and reference it.
   */
  if (framework === "nextjs" && ui !== "html") {
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
      dev: `NEXT_PUBLIC_CHAT_API=${customApiPath} next dev`,
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

  if (framework === "nextjs" && ui === "shadcn") {
    // add shadcn dependencies to package.json
    packageJson.dependencies = {
      ...packageJson.dependencies,
      "tailwind-merge": "^2",
      "@radix-ui/react-slot": "^1",
      "class-variance-authority": "^0.7",
      "lucide-react": "^0.291",
      remark: "^14.0.3",
      "remark-code-import": "^1.2.0",
      "remark-gfm": "^3.0.1",
      "remark-math": "^5.1.1",
      "react-markdown": "^8.0.7",
      "react-syntax-highlighter": "^15.5.0",
    };

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "@types/react-syntax-highlighter": "^15.5.6",
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

const installPythonTemplate = async ({
  root,
  template,
  framework,
}: Pick<InstallTemplateArgs, "root" | "framework" | "template">) => {
  console.log("\nInitializing Python project with template:", template, "\n");
  const templatePath = path.join(__dirname, "types", template, framework);
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

export const installTemplate = async (
  props: InstallTemplateArgs & { backend: boolean },
) => {
  process.chdir(props.root);
  if (props.framework === "fastapi") {
    await installPythonTemplate(props);
  } else {
    await installTSTemplate(props);
  }

  if (props.backend) {
    // This is a backend, so we need to copy the test data and create the env file.

    // Copy the environment file to the target directory.
    await createEnvLocalFile(props.root, props.framework, props.openAIKey);

    // Copy test pdf file
    await copyTestData(
      props.root,
      props.framework,
      props.packageManager,
      props.engine,
    );
  }
};

export * from "./types";
