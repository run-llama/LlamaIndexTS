import fs from "fs/promises";
import path from "path";
import { cyan, red } from "picocolors";
import { parse, stringify } from "smol-toml";
import terminalLink from "terminal-link";
import { copy } from "./copy";
import { templatesDir } from "./dir";
import { isPoetryAvailable, tryPoetryInstall } from "./poetry";
const getAdditionalDependencies = (vectorDb, dataSource, tools) => {
  const dependencies = [];
  // Add vector db dependencies
  switch (vectorDb) {
    case "mongo": {
      dependencies.push({
        name: "llama-index-vector-stores-mongodb",
        version: "^0.1.3",
      });
      break;
    }
    case "pg": {
      dependencies.push({
        name: "llama-index-vector-stores-postgres",
        version: "^0.1.1",
      });
    }
    case "pinecone": {
      dependencies.push({
        name: "llama-index-vector-stores-pinecone",
        version: "^0.1.3",
      });
      break;
    }
  }
  // Add data source dependencies
  const dataSourceType =
    dataSource === null || dataSource === void 0 ? void 0 : dataSource.type;
  if (dataSourceType === "file" || dataSourceType === "folder") {
    // llama-index-readers-file (pdf, excel, csv) is already included in llama_index package
    dependencies.push({
      name: "docx2txt",
      version: "^0.8",
    });
  } else if (dataSourceType === "web") {
    dependencies.push({
      name: "llama-index-readers-web",
      version: "^0.1.6",
    });
  }
  // Add tools dependencies
  tools === null || tools === void 0
    ? void 0
    : tools.forEach((tool) => {
        var _a;
        (_a = tool.dependencies) === null || _a === void 0
          ? void 0
          : _a.forEach((dep) => {
              dependencies.push(dep);
            });
      });
  return dependencies;
};
const mergePoetryDependencies = (dependencies, existingDependencies) => {
  var _a, _b, _c;
  for (const dependency of dependencies) {
    let value =
      (_a = existingDependencies[dependency.name]) !== null && _a !== void 0
        ? _a
        : {};
    // default string value is equal to attribute "version"
    if (typeof value === "string") {
      value = { version: value };
    }
    value.version =
      (_b = dependency.version) !== null && _b !== void 0 ? _b : value.version;
    value.extras =
      (_c = dependency.extras) !== null && _c !== void 0 ? _c : value.extras;
    if (value.version === undefined) {
      throw new Error(
        `Dependency "${dependency.name}" is missing attribute "version"!`,
      );
    }
    existingDependencies[dependency.name] = value;
  }
};
export const addDependencies = async (projectDir, dependencies) => {
  if (dependencies.length === 0) return;
  const FILENAME = "pyproject.toml";
  try {
    // Parse toml file
    const file = path.join(projectDir, FILENAME);
    const fileContent = await fs.readFile(file, "utf8");
    const fileParsed = parse(fileContent);
    // Modify toml dependencies
    const tool = fileParsed.tool;
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
export const installPythonDependencies = ({ noRoot } = { noRoot: false }) => {
  if (isPoetryAvailable()) {
    console.log(
      `Installing python dependencies using poetry. This may take a while...`,
    );
    const installSuccessful = tryPoetryInstall(noRoot);
    if (!installSuccessful) {
      console.error(
        red(
          "Installing dependencies using poetry failed. Please check error log above and try running create-llama again.",
        ),
      );
      process.exit(1);
    }
  } else {
    console.error(
      red(
        `Poetry is not available in the current environment. Please check ${terminalLink("Poetry Installation", `https://python-poetry.org/docs/#installation`)} to install poetry first, then run create-llama again.`,
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
  dataSource,
  tools,
  postInstallAction,
}) => {
  console.log("\nInitializing Python project with template:", template, "\n");
  const templatePath = path.join(templatesDir, "types", template, framework);
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
    const enginePath = path.join(root, "app", "engine");
    const compPath = path.join(templatesDir, "components");
    const vectorDbDirName =
      vectorDb !== null && vectorDb !== void 0 ? vectorDb : "none";
    const VectorDBPath = path.join(
      compPath,
      "vectordbs",
      "python",
      vectorDbDirName,
    );
    await copy("**", enginePath, {
      parents: true,
      cwd: VectorDBPath,
    });
    // Copy engine code
    if (tools !== undefined && tools.length > 0) {
      await copy("**", enginePath, {
        parents: true,
        cwd: path.join(compPath, "engines", "python", "agent"),
      });
      // Write tools_config.json
      const configContent = {};
      tools.forEach((tool) => {
        var _a;
        configContent[tool.name] =
          (_a = tool.config) !== null && _a !== void 0 ? _a : {};
      });
      const configFilePath = path.join(root, "tools_config.json");
      await fs.writeFile(
        configFilePath,
        JSON.stringify(configContent, null, 2),
      );
    } else {
      await copy("**", enginePath, {
        parents: true,
        cwd: path.join(compPath, "engines", "python", "chat"),
      });
    }
    const dataSourceType =
      dataSource === null || dataSource === void 0 ? void 0 : dataSource.type;
    if (dataSourceType !== undefined && dataSourceType !== "none") {
      const loaderPath =
        dataSourceType === "folder"
          ? path.join(compPath, "loaders", "python", "file")
          : path.join(compPath, "loaders", "python", dataSourceType);
      await copy("**", enginePath, {
        parents: true,
        cwd: loaderPath,
      });
    }
  }
  const addOnDependencies = getAdditionalDependencies(
    vectorDb,
    dataSource,
    tools,
  );
  await addDependencies(root, addOnDependencies);
  if (postInstallAction !== "none") {
    installPythonDependencies();
  }
};
