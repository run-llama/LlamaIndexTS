#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import ciInfo from "ci-info";
import Commander from "commander";
import Conf from "conf";
import fs from "fs";
import path from "path";
import { blue, bold, cyan, green, red, yellow } from "picocolors";
import prompts from "prompts";
import checkForUpdate from "update-check";
import { createApp } from "./create-app";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${green("<project-directory>")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    "--eslint",
    `

  Initialize with eslint config.
`,
  )
  .option(
    "--import-alias <alias-to-configure>",
    `

  Specify import alias to use (default "@/*").
`,
  )
  .option(
    "--use-npm",
    `

  Explicitly tell the CLI to bootstrap the application using npm
`,
  )
  .option(
    "--use-pnpm",
    `

  Explicitly tell the CLI to bootstrap the application using pnpm
`,
  )
  .option(
    "--use-yarn",
    `

  Explicitly tell the CLI to bootstrap the application using Yarn
`,
  )
  .option(
    "--use-bun",
    `

  Explicitly tell the CLI to bootstrap the application using Bun
`,
  )
  .option(
    "--reset-preferences",
    `

  Explicitly tell the CLI to reset any stored preferences
`,
  )
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = !!program.useNpm
  ? "npm"
  : !!program.usePnpm
  ? "pnpm"
  : !!program.useYarn
  ? "yarn"
  : !!program.useBun
  ? "bun"
  : getPkgManager();

async function run(): Promise<void> {
  const conf = new Conf({ projectName: "create-llama" });

  if (program.resetPreferences) {
    conf.clear();
    console.log(`Preferences reset successfully`);
    return;
  }

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems![0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${cyan(program.name())} ${green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${cyan(program.name())} ${green("my-next-app")}\n\n` +
        `Run ${cyan(`${program.name()} --help`)} to see all options.`,
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a project called ${red(
        `"${projectName}"`,
      )} because of npm naming restrictions:`,
    );

    problems!.forEach((p) => console.error(`    ${red(bold("*"))} ${p}`));
    process.exit(1);
  }

  /**
   * Verify the project dir is empty or doesn't exist
   */
  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const folderExists = fs.existsSync(root);

  if (folderExists && !isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const preferences = (conf.get("preferences") || {}) as Record<
    string,
    boolean | string
  >;

  const defaults: typeof preferences = {
    template: "simple",
    framework: "nextjs",
    engine: "simple",
    ui: "html",
    eslint: true,
  };
  const getPrefOrDefault = (field: string) =>
    preferences[field] ?? defaults[field];

  if (!program.template) {
    if (ciInfo.isCI) {
      program.template = getPrefOrDefault("template");
    } else {
      const { template } = await prompts(
        {
          type: "select",
          name: "template",
          message: "Which template would you like to use?",
          choices: [
            { title: "Chat without streaming", value: "simple" },
            { title: "Chat with streaming", value: "streaming" },
          ],
          initial: 1,
        },
        {
          onCancel: () => {
            console.error("Exiting.");
            process.exit(1);
          },
        },
      );
      program.template = template;
      preferences.template = template;
    }
  }

  if (!program.framework) {
    if (ciInfo.isCI) {
      program.framework = getPrefOrDefault("framework");
    } else {
      const { framework } = await prompts(
        {
          type: "select",
          name: "framework",
          message: "Which framework would you like to use?",
          choices: [
            { title: "NextJS", value: "nextjs" },
            { title: "Express", value: "express" },
            { title: "FastAPI (Python)", value: "fastapi" },
          ],
          initial: 0,
        },
        {
          onCancel: () => {
            console.error("Exiting.");
            process.exit(1);
          },
        },
      );
      program.framework = framework;
      preferences.framework = framework;
    }
  }

  if (program.framework === "nextjs") {
    if (!program.ui) {
      if (ciInfo.isCI) {
        program.ui = getPrefOrDefault("ui");
      } else {
        const { ui } = await prompts(
          {
            type: "select",
            name: "ui",
            message: "Which UI would you like to use?",
            choices: [
              { title: "Just HTML", value: "html" },
              { title: "Shadcn", value: "shadcn" },
            ],
            initial: 0,
          },
          {
            onCancel: () => {
              console.error("Exiting.");
              process.exit(1);
            },
          },
        );
        program.ui = ui;
        preferences.ui = ui;
      }
    }
  }

  if (program.framework === "express" || program.framework === "nextjs") {
    if (!program.engine) {
      if (ciInfo.isCI) {
        program.engine = getPrefOrDefault("engine");
      } else {
        const { engine } = await prompts(
          {
            type: "select",
            name: "engine",
            message: "Which chat engine would you like to use?",
            choices: [
              { title: "SimpleChatEngine", value: "simple" },
              { title: "ContextChatEngine", value: "context" },
            ],
            initial: 0,
          },
          {
            onCancel: () => {
              console.error("Exiting.");
              process.exit(1);
            },
          },
        );
        program.engine = engine;
        preferences.engine = engine;
      }
    }
  }

  if (
    program.framework !== "fastapi" &&
    !process.argv.includes("--eslint") &&
    !process.argv.includes("--no-eslint")
  ) {
    if (ciInfo.isCI) {
      program.eslint = getPrefOrDefault("eslint");
    } else {
      const styledEslint = blue("ESLint");
      const { eslint } = await prompts({
        onState: onPromptState,
        type: "toggle",
        name: "eslint",
        message: `Would you like to use ${styledEslint}?`,
        initial: getPrefOrDefault("eslint"),
        active: "Yes",
        inactive: "No",
      });
      program.eslint = Boolean(eslint);
      preferences.eslint = Boolean(eslint);
    }
  }

  await createApp({
    template: program.template,
    framework: program.framework,
    engine: program.engine,
    ui: program.ui,
    appPath: resolvedProjectPath,
    packageManager,
    eslint: program.eslint,
  });
  conf.set("preferences", preferences);
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage =
        packageManager === "yarn"
          ? "yarn global add create-llama"
          : packageManager === "pnpm"
          ? "pnpm add -g create-llama"
          : packageManager === "bun"
          ? "bun add -g create-llama"
          : "npm i -g create-llama";

      console.log(
        yellow(bold("A new version of `create-llama` is available!")) +
          "\n" +
          "You can update by running: " +
          cyan(updateMessage) +
          "\n",
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${cyan(reason.command)} has failed.`);
    } else {
      console.log(
        red("Unexpected error. Please report it as a bug:") + "\n",
        reason,
      );
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
