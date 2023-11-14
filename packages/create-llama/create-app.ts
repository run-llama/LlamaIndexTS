/* eslint-disable import/no-extraneous-dependencies */
import path from "path";
import { green } from "picocolors";
import { tryGitInit } from "./helpers/git";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";

import fs from "fs";
import terminalLink from "terminal-link";
import type { InstallTemplateArgs } from "./templates";
import { installTemplate } from "./templates";

export async function createApp({
  template,
  framework,
  engine,
  ui,
  appPath,
  packageManager,
  eslint,
  frontend,
  openAIKey,
}: Omit<
  InstallTemplateArgs,
  "appName" | "root" | "isOnline" | "customApiPath"
> & {
  appPath: string;
  frontend: boolean;
}): Promise<void> {
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
    openAIKey,
  };

  if (frontend) {
    // install backend
    const backendRoot = path.join(root, "backend");
    await makeDir(backendRoot);
    await installTemplate({ ...args, root: backendRoot, backend: true });
    // install frontend
    const frontendRoot = path.join(root, "frontend");
    await makeDir(frontendRoot);
    await installTemplate({
      ...args,
      root: frontendRoot,
      framework: "nextjs",
      customApiPath: "http://localhost:8000/api/chat",
      backend: false,
    });
    // copy readme for fullstack
    await fs.promises.copyFile(
      path.join(__dirname, "templates", "README-fullstack.md"),
      path.join(root, "README.md"),
    );
  } else {
    await installTemplate({ ...args, backend: true });
  }

  process.chdir(root);
  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  console.log(`${green("Success!")} Created ${appName} at ${appPath}`);

  console.log(
    `Now have a look at the ${terminalLink(
      "README.md",
      `file://${appName}/README.md`,
    )} and learn how to get started.`,
  );
  console.log();
}
