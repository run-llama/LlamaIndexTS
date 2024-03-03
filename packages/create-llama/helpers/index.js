import fs from "fs/promises";
import path from "path";
import { cyan } from "picocolors";
import { COMMUNITY_OWNER, COMMUNITY_REPO } from "./constant";
import { copy } from "./copy";
import { templatesDir } from "./dir";
import { callPackageManager } from "./install";
import { installLlamapackProject } from "./llama-pack";
import { isHavingPoetryLockFile, tryPoetryRun } from "./poetry";
import { installPythonTemplate } from "./python";
import { downloadAndExtractRepo } from "./repo";
import { installTSTemplate } from "./typescript";
const createEnvLocalFile = async (root, opts) => {
  var _a;
  const envFileName = ".env";
  let content = "";
  const model =
    (opts === null || opts === void 0 ? void 0 : opts.model) || "gpt-3.5-turbo";
  content += `MODEL=${model}\n`;
  if (
    (opts === null || opts === void 0 ? void 0 : opts.framework) === "nextjs"
  ) {
    content += `NEXT_PUBLIC_MODEL=${model}\n`;
  }
  console.log("\nUsing OpenAI model: ", model, "\n");
  if (opts === null || opts === void 0 ? void 0 : opts.openAiKey) {
    content += `OPENAI_API_KEY=${opts === null || opts === void 0 ? void 0 : opts.openAiKey}\n`;
  }
  switch (opts === null || opts === void 0 ? void 0 : opts.vectorDb) {
    case "mongo": {
      content += `# For generating a connection URI, see https://www.mongodb.com/docs/guides/atlas/connection-string\n`;
      content += `MONGO_URI=\n`;
      content += `MONGODB_DATABASE=\n`;
      content += `MONGODB_VECTORS=\n`;
      content += `MONGODB_VECTOR_INDEX=\n`;
      break;
    }
    case "pg": {
      content += `# For generating a connection URI, see https://docs.timescale.com/use-timescale/latest/services/create-a-service\n`;
      content += `PG_CONNECTION_STRING=\n`;
      break;
    }
    case "pinecone": {
      content += `PINECONE_API_KEY=\n`;
      content += `PINECONE_ENVIRONMENT=\n`;
      content += `PINECONE_INDEX_NAME=\n`;
      break;
    }
  }
  switch (
    (_a = opts === null || opts === void 0 ? void 0 : opts.dataSource) ===
      null || _a === void 0
      ? void 0
      : _a.type
  ) {
    case "web": {
      const webConfig =
        opts === null || opts === void 0 ? void 0 : opts.dataSource.config;
      content += `# web loader config\n`;
      content += `BASE_URL=${webConfig.baseUrl}\n`;
      content += `URL_PREFIX=${webConfig.baseUrl}\n`;
      content += `MAX_DEPTH=${webConfig.depth}\n`;
      break;
    }
  }
  if (content) {
    await fs.writeFile(path.join(root, envFileName), content);
    console.log(`Created '${envFileName}' file. Please check the settings.`);
  }
};
const generateContextData = async (
  framework,
  packageManager,
  openAiKey,
  vectorDb,
) => {
  if (packageManager) {
    const runGenerate = `${cyan(
      framework === "fastapi"
        ? "poetry run python app/engine/generate.py"
        : `${packageManager} run generate`,
    )}`;
    const hasOpenAiKey = openAiKey || process.env["OPENAI_API_KEY"];
    const hasVectorDb = vectorDb && vectorDb !== "none";
    if (framework === "fastapi") {
      if (hasOpenAiKey && !hasVectorDb && isHavingPoetryLockFile()) {
        console.log(`Running ${runGenerate} to generate the context data.`);
        const result = tryPoetryRun("python app/engine/generate.py");
        if (!result) {
          console.log(`Failed to run ${runGenerate}.`);
          process.exit(1);
        }
        console.log(`Generated context data`);
        return;
      }
    } else {
      if (hasOpenAiKey && vectorDb === "none") {
        console.log(`Running ${runGenerate} to generate the context data.`);
        await callPackageManager(packageManager, true, ["run", "generate"]);
        return;
      }
    }
    const settings = [];
    if (!hasOpenAiKey) settings.push("your OpenAI key");
    if (hasVectorDb) settings.push("your Vector DB environment variables");
    const settingsMessage =
      settings.length > 0 ? `After setting ${settings.join(" and ")}, ` : "";
    const generateMessage = `run ${runGenerate} to generate the context data.`;
    console.log(`\n${settingsMessage}${generateMessage}\n\n`);
  }
};
const copyContextData = async (root, dataSource) => {
  var _a;
  const destPath = path.join(root, "data");
  const dataSourceConfig =
    dataSource === null || dataSource === void 0 ? void 0 : dataSource.config;
  // Copy file
  if (
    (dataSource === null || dataSource === void 0
      ? void 0
      : dataSource.type) === "file"
  ) {
    if (dataSourceConfig.path) {
      console.log(`\nCopying file to ${cyan(destPath)}\n`);
      await fs.mkdir(destPath, { recursive: true });
      await fs.copyFile(
        dataSourceConfig.path,
        path.join(destPath, path.basename(dataSourceConfig.path)),
      );
    } else {
      console.log("Missing file path in config");
      process.exit(1);
    }
    return;
  }
  // Copy folder
  if (
    (dataSource === null || dataSource === void 0
      ? void 0
      : dataSource.type) === "folder"
  ) {
    const srcPath =
      (_a = dataSourceConfig.path) !== null && _a !== void 0
        ? _a
        : path.join(templatesDir, "components", "data");
    console.log(`\nCopying data to ${cyan(destPath)}\n`);
    await copy("**", destPath, {
      parents: true,
      cwd: srcPath,
    });
    return;
  }
};
const installCommunityProject = async ({ root, communityProjectPath }) => {
  console.log("\nInstalling community project:", communityProjectPath);
  await downloadAndExtractRepo(root, {
    username: COMMUNITY_OWNER,
    name: COMMUNITY_REPO,
    branch: "main",
    filePath: communityProjectPath,
  });
};
export const installTemplate = async (props) => {
  process.chdir(props.root);
  if (props.template === "community" && props.communityProjectPath) {
    await installCommunityProject(props);
    return;
  }
  if (props.template === "llamapack" && props.llamapack) {
    await installLlamapackProject(props);
    return;
  }
  if (props.framework === "fastapi") {
    await installPythonTemplate(props);
  } else {
    await installTSTemplate(props);
  }
  if (props.backend) {
    // This is a backend, so we need to copy the test data and create the env file.
    // Copy the environment file to the target directory.
    await createEnvLocalFile(props.root, {
      openAiKey: props.openAiKey,
      vectorDb: props.vectorDb,
      model: props.model,
      framework: props.framework,
      dataSource: props.dataSource,
    });
    if (props.engine === "context") {
      await copyContextData(props.root, props.dataSource);
      if (
        props.postInstallAction === "runApp" ||
        props.postInstallAction === "dependencies"
      ) {
        await generateContextData(
          props.framework,
          props.packageManager,
          props.openAiKey,
          props.vectorDb,
        );
      }
    }
  } else {
    // this is a frontend for a full-stack app, create .env file with model information
    const content = `MODEL=${props.model}\nNEXT_PUBLIC_MODEL=${props.model}\n`;
    await fs.writeFile(path.join(props.root, ".env"), content);
  }
};
export * from "./types";
