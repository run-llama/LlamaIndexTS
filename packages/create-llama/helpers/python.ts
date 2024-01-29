import fs from "fs/promises";
import path from "path";
import { cyan, red, yellow } from "picocolors";
import { parse, stringify } from "smol-toml";
import terminalLink from "terminal-link";
import { copy } from "./copy";
import { isPoetryAvailable, tryPoetryInstall } from "./poetry";
import { InstallTemplateArgs, TemplateVectorDB } from "./types";

interface Dependency {
  name: string;
  version?: string;
  extras?: string[];
}

const getAdditionalDependencies = (vectorDb?: TemplateVectorDB) => {
  const dependencies: Dependency[] = [];

  switch (vectorDb) {
    case "mongo": {
      dependencies.push({
        name: "pymongo",
        version: "^4.6.1",
      });
      break;
    }
    case "pg": {
      dependencies.push({
        name: "llama-index",
        extras: ["postgres"],
      });
    }
  }

  return dependencies;
};

const mergePoetryDependencies = (
  dependencies: Dependency[],
  existingDependencies: Record<string, Omit<Dependency, "name">>,
) => {
  for (const dependency of dependencies) {
    let value = existingDependencies[dependency.name] ?? {};

    // default string value is equal to attribute "version"
    if (typeof value === "string") {
      value = { version: value };
    }

    value.version = dependency.version ?? value.version;
    value.extras = dependency.extras ?? value.extras;

    if (value.version === undefined) {
      throw new Error(
        `Dependency "${dependency.name}" is missing attribute "version"!`,
      );
    }

    existingDependencies[dependency.name] = value;
  }
};

export const addDependencies = async (
  projectDir: string,
  dependencies: Dependency[],
) => {
  if (dependencies.length === 0) return;

  const FILENAME = "pyproject.toml";
  try {
    // Parse toml file
    const file = path.join(projectDir, FILENAME);
    const fileContent = await fs.readFile(file, "utf8");
    const fileParsed = parse(fileContent);

    // Modify toml dependencies
    const tool = fileParsed.tool as any;
    const existingDependencies = tool.poetry.dependencies;
    mergePoetryDependencies(dependencies, existingDependencies);

    // Write toml file
    const newFileContent = stringify(fileParsed);
    await fs.writeFile(file, newFileContent);

    const dependenciesString = dependencies.map((d) => d.name).join(", ");
    console.log(`\nAdded ${dependenciesString} to ${cyan(FILENAME)}\n`);
  } catch (error) {
    console.log(
      `Error while updating dependencies for Poetry project file ${FILENAME}\n`,
      error,
    );
  }
};

export const installPythonDependencies = (
  { noRoot }: { noRoot: boolean } = { noRoot: false },
) => {
  if (isPoetryAvailable()) {
    console.log(
      `Installing python dependencies using poetry. This may take a while...`,
    );
    const installSuccessful = tryPoetryInstall(noRoot);
    if (!installSuccessful) {
      console.error(
        red("Install failed. Please install dependencies manually."),
      );
      process.exit(1);
    }
  } else {
    console.warn(
      yellow(
        `Poetry is not available in the current environment. The Python dependencies will not be installed automatically.
Please check ${terminalLink(
          "Poetry Installation",
          `https://python-poetry.org/docs/#installation`,
        )} to install poetry first, then install the dependencies manually.`,
      ),
    );
    process.exit(1);
  }
};

export const installPythonTemplate = async ({
  root,
  template,
  framework,
  engine,
  vectorDb,
  postInstallAction,
}: Pick<
  InstallTemplateArgs,
  | "root"
  | "framework"
  | "template"
  | "engine"
  | "vectorDb"
  | "postInstallAction"
>) => {
  console.log("\nInitializing Python project with template:", template, "\n");
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "types",
    template,
    framework,
  );
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

  if (engine === "context") {
    const compPath = path.join(__dirname, "..", "templates", "components");
    const VectorDBPath = path.join(
      compPath,
      "vectordbs",
      "python",
      vectorDb || "none",
    );
    await copy("**", path.join(root, "app", "engine"), {
      parents: true,
      cwd: VectorDBPath,
    });
  }

  const addOnDependencies = getAdditionalDependencies(vectorDb);
  await addDependencies(root, addOnDependencies);

  if (postInstallAction !== "none") {
    installPythonDependencies();
  }
};
