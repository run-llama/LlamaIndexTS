/* eslint-disable import/no-extraneous-dependencies */
import path from "path";
import { green } from "picocolors";
import type { PackageManager } from "./helpers/get-pkg-manager";
import { tryGitInit } from "./helpers/git";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";

import type {
  TemplateEngine,
  TemplateFramework,
  TemplateType,
  TemplateUI,
} from "./templates";
import { installPythonTemplate, installTemplate } from "./templates";

export async function createApp({
  template,
  framework,
  engine,
  ui,
  appPath,
  packageManager,
  eslint,
}: {
  template: TemplateType;
  framework: TemplateFramework;
  engine: TemplateEngine;
  ui: TemplateUI;
  appPath: string;
  packageManager: PackageManager;
  eslint: boolean;
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

  process.chdir(root);

  if (framework === "fastapi") {
    await installPythonTemplate({ appName, root, template, framework });
  } else {
    await installTemplate({
      appName,
      root,
      template,
      framework,
      engine,
      ui,
      packageManager,
      isOnline,
      eslint,
    });
  }

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  console.log(`${green("Success!")} Created ${appName} at ${appPath}`);
  console.log();
}
