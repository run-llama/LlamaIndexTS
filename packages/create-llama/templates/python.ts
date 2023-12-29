import fs from "fs/promises";
import path from "path";
import { cyan } from "picocolors";
import { parse, stringify } from "smol-toml";
import { copy } from "../helpers/copy";
import { InstallTemplateArgs, TemplateVectorDB } from "./types";

interface Dependency {
  name: string;
  version: string;
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
  }

  return dependencies;
};

const addDependencies = async (
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
    const dependencies = tool.poetry.dependencies as any;
    for (const dependency of dependencies) {
      dependencies[dependency.name] = dependency.version;
    }

    // Write toml file
    const newFileContent = stringify(fileParsed);
    await fs.writeFile(file, newFileContent);

    const dependenciesString = dependencies
      .map((d: Dependency) => d.name)
      .join(", ");
    console.log(`\nAdded ${dependenciesString} to ${cyan(FILENAME)}\n`);
  } catch (error) {
    console.log(
      `Error while updating dependencies for Poetry project file ${FILENAME}\n`,
      error,
    );
    console.log(error);
  }
};

export const installPythonTemplate = async ({
  root,
  template,
  framework,
  engine,
  vectorDb,
}: Pick<
  InstallTemplateArgs,
  "root" | "framework" | "template" | "engine" | "vectorDb"
>) => {
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

  if (engine === "context") {
    const compPath = path.join(__dirname, "components");
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

  console.log(
    "\nPython project, dependencies won't be installed automatically.\n",
  );
};
