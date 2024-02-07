/* eslint-disable import/no-extraneous-dependencies */
import path from "path";
import { green, red } from "picocolors";
import { tryGitInit } from "./helpers/git";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";

import fs from "fs";
import terminalLink from "terminal-link";
import type { InstallTemplateArgs } from "./helpers";
import { installTemplate } from "./helpers";
import { templatesDir } from "./helpers/dir";
import { toolsRequireConfig } from "./helpers/tools";

export type InstallAppArgs = Omit<
  InstallTemplateArgs,
  "appName" | "root" | "isOnline" | "customApiPath"
> & {
  appPath: string;
  frontend: boolean;
};

export async function createApp({
  template,
  framework,
  engine,
  ui,
  appPath,
  packageManager,
  eslint,
  frontend,
  openAiKey,
  model,
  communityProjectPath,
  llamapack,
  vectorDb,
  externalPort,
  postInstallAction,
  dataSource,
  tools,
}: InstallAppArgs): Promise<void> {
  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again.",
    );
    console.error(
      "It is likely you do not have write permissions for this folder.",
    );
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());

  console.log(`Creating a new LlamaIndex app in ${green(root)}.`);
  console.log();

  const args = {
    appName,
    root,
    template,
    framework,
    engine,
    ui,
    packageManager,
    isOnline,
    eslint,
    openAiKey,
    model,
    communityProjectPath,
    llamapack,
    vectorDb,
    externalPort,
    postInstallAction,
    dataSource,
    tools,
  };

  let installationErrors = [];

  if (frontend) {
    // install backend
    const backendRoot = path.join(root, "backend");
    await makeDir(backendRoot);
    try {
      await installTemplate({
        ...args,
        root: backendRoot,
        backend: true,
      });
    } catch (error) {
      installationErrors.push(error);
      console.log(red(`${error}`));
    }
    // install frontend
    const frontendRoot = path.join(root, "frontend");
    await makeDir(frontendRoot);
    try {
      await installTemplate({
        ...args,
        root: frontendRoot,
        framework: "nextjs",
        customApiPath: `http://localhost:${externalPort ?? 8000}/api/chat`,
        backend: false,
      });
    } catch (error) {
      installationErrors.push(error);
    }

    // copy readme for fullstack
    await fs.promises.copyFile(
      path.join(templatesDir, "README-fullstack.md"),
      path.join(root, "README.md"),
    );
  } else {
    try {
      await installTemplate({ ...args, backend: true, forBackend: framework });
    } catch (error) {
      installationErrors.push(error);
    }
  }

  process.chdir(root);
  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  if (toolsRequireConfig(tools)) {
    console.log(
      red(
        `You have selected tools that require configuration. Please configure them in the ${terminalLink(
          "tools_config.json",
          `file://${root}/tools_config.json`,
        )} file.`,
      ),
    );
  }

  console.log();
  if (installationErrors.length > 0) {
    for (const error of installationErrors) {
      console.log(red(`${error}`));
    }
    console.log(
      "\nExiting installation. Please check the generated code or try create app again!",
    );
    process.exit(1);
  } else {
    console.log(`${green("Success!")} Created ${appName} at ${appPath}`);
    console.log(
      `Now have a look at the ${terminalLink(
        "README.md",
        `file://${root}/README.md`,
      )} and learn how to get started.`,
    );
    console.log();
  }
}
