import { copy } from "../helpers/copy";
import { install } from "../helpers/install";
import { makeDir } from "../helpers/make-dir";

import { Sema } from "async-sema";
import { async as glob } from "fast-glob";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { bold, cyan } from "picocolors";
import { version } from "../package.json";

import { GetTemplateFileArgs, InstallTemplateArgs } from "./types";

/**
 * Get the file path for a given file in a template, e.g. "next.config.js".
 */
export const getTemplateFile = ({
  template,
  framework,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(__dirname, template, framework, file);
};

export const SRC_DIR_NAMES = ["app", "pages", "styles"];

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
  eslint,
  srcDir,
  importAlias,
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

  const tsconfigFile = path.join(root, "tsconfig.json");
  await fs.writeFile(
    tsconfigFile,
    (await fs.readFile(tsconfigFile, "utf8"))
      .replace(
        `"@/*": ["./*"]`,
        srcDir ? `"@/*": ["./src/*"]` : `"@/*": ["./*"]`,
      )
      .replace(`"@/*":`, `"${importAlias}":`),
  );

  // update import alias in any files if not using the default
  if (importAlias !== "@/*") {
    const files = await glob("**/*", {
      cwd: root,
      dot: true,
      stats: false,
    });
    const writeSema = new Sema(8, { capacity: files.length });
    await Promise.all(
      files.map(async (file) => {
        // We don't want to modify compiler options in [ts/js]config.json
        if (file === "tsconfig.json" || file === "jsconfig.json") return;
        await writeSema.acquire();
        const filePath = path.join(root, file);
        if ((await fs.stat(filePath)).isFile()) {
          await fs.writeFile(
            filePath,
            (await fs.readFile(filePath, "utf8")).replace(
              `@/`,
              `${importAlias.replace(/\*/g, "")}`,
            ),
          );
        }
        await writeSema.release();
      }),
    );
  }

  if (srcDir) {
    await makeDir(path.join(root, "src"));
    await Promise.all(
      SRC_DIR_NAMES.map(async (file) => {
        await fs
          .rename(path.join(root, file), path.join(root, "src", file))
          .catch((err) => {
            if (err.code !== "ENOENT") {
              throw err;
            }
          });
      }),
    );

    const isAppTemplate = template.startsWith("app");

    // Change the `Get started by editing pages/index` / `app/page` to include `src`
    const indexPageFile = path.join(
      "src",
      isAppTemplate ? "app" : "pages",
      `${isAppTemplate ? "page" : "index"}.tsx`,
    );

    await fs.writeFile(
      indexPageFile,
      (await fs.readFile(indexPageFile, "utf8")).replace(
        isAppTemplate ? "app/page" : "pages/index",
        isAppTemplate ? "src/app/page" : "src/pages/index",
      ),
    );

    if (framework === "nextjs") {
      const tailwindConfigFile = path.join(root, "tailwind.config.ts");
      await fs.writeFile(
        tailwindConfigFile,
        (await fs.readFile(tailwindConfigFile, "utf8")).replace(
          /\.\/(\w+)\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}/g,
          "./src/$1/**/*.{js,ts,jsx,tsx,mdx}",
        ),
      );
    }
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

export * from "./types";
