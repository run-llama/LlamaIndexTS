#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import Commander from "commander";
import Conf from "conf";
import fs from "fs";
import path from "path";
import { bold, cyan, green, red, yellow } from "picocolors";
import prompts from "prompts";
import checkForUpdate from "update-check";
import { createApp } from "./create-app";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { runApp } from "./helpers/run-app";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";
import { QuestionArgs, askQuestions, onPromptState } from "./questions";

let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

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
    "--reset-preferences",
    `

  Explicitly tell the CLI to reset any stored preferences
`,
  )
  .option(
    "--template <template>",
    `

  Select a template to bootstrap the application with.
`,
  )
  .option(
    "--engine <engine>",
    `

  Select a chat engine to bootstrap the application with.
`,
  )
  .option(
    "--framework <framework>",
    `

  Select a framework to bootstrap the application with.
`,
  )
  .option(
    "--open-ai-key <key>",
    `

  Provide an OpenAI API key.
`,
  )
  .option(
    "--ui <ui>",
    `

  Select a UI to bootstrap the application with.
`,
  )
  .option(
    "--frontend",
    `

  Whether to generate a frontend for your backend.
`,
  )
  .option(
    "--model <model>",
    `

  Select OpenAI model to use. E.g. gpt-3.5-turbo.
`,
  )
  .option(
    "--port <port>",
    `

  Select UI port.
`,
  )
  .option(
    "--external-port <external>",
    `

  Select external port.
`,
  )
  .option(
    "--post-install-action <action>",
    `

  Choose an action after installation. For example, 'runApp' or 'dependencies'. The default option is just to generate the app.
`,
  )
  .allowUnknownOption()
  .parse(process.argv);
if (process.argv.includes("--no-frontend")) {
  program.frontend = false;
}
if (process.argv.includes("--no-eslint")) {
  program.eslint = false;
}

const packageManager = !!program.useNpm
  ? "npm"
  : !!program.usePnpm
    ? "pnpm"
    : !!program.useYarn
      ? "yarn"
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
        `  ${cyan(program.name())} ${green("my-app")}\n\n` +
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

  const preferences = (conf.get("preferences") || {}) as QuestionArgs;
  await askQuestions(program as unknown as QuestionArgs, preferences);

  await createApp({
    template: program.template,
    framework: program.framework,
    engine: program.engine,
    ui: program.ui,
    appPath: resolvedProjectPath,
    packageManager,
    eslint: program.eslint,
    frontend: program.frontend,
    openAiKey: program.openAiKey,
    model: program.model,
    communityProjectPath: program.communityProjectPath,
    llamapack: program.llamapack,
    vectorDb: program.vectorDb,
    externalPort: program.externalPort,
    postInstallAction: program.postInstallAction,
    dataSource: program.dataSource,
  });
  conf.set("preferences", preferences);

  if (program.postInstallAction === "runApp") {
    console.log("Running app...");
    await runApp(
      root,
      program.frontend,
      program.framework,
      program.port,
      program.externalPort,
    );
  }
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage =
        packageManager === "yarn"
          ? "yarn global add create-llama@latest"
          : packageManager === "pnpm"
            ? "pnpm add -g create-llama@latest"
            : "npm i -g create-llama@latest";

      console.log(
        yellow(bold("A new version of `create-llama` is available!")) +
          "\n" +
          "You can update by running: " +
          cyan(updateMessage) +
          "\n",
      );
    }
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
