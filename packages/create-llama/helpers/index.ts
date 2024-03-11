import { copy } from "./copy";
import { callPackageManager } from "./install";

import fs from "fs/promises";
import path from "path";
import { cyan } from "picocolors";

import { COMMUNITY_OWNER, COMMUNITY_REPO } from "./constant";
import { templatesDir } from "./dir";
import { createBackendEnvFile, createFrontendEnvFile } from "./env-variables";
import { PackageManager } from "./get-pkg-manager";
import { installLlamapackProject } from "./llama-pack";
import { isHavingPoetryLockFile, tryPoetryRun } from "./poetry";
import { installPythonTemplate } from "./python";
import { downloadAndExtractRepo } from "./repo";
import {
  FileSourceConfig,
  InstallTemplateArgs,
  TemplateDataSource,
  TemplateFramework,
  TemplateVectorDB,
} from "./types";
import { installTSTemplate } from "./typescript";

// eslint-disable-next-line max-params
async function generateContextData(
  framework: TemplateFramework,
  packageManager?: PackageManager,
  openAiKey?: string,
  vectorDb?: TemplateVectorDB,
  dataSource?: TemplateDataSource,
  llamaCloudKey?: string,
) {
  if (packageManager) {
    const runGenerate = `${cyan(
      framework === "fastapi"
        ? "poetry run python app/engine/generate.py"
        : `${packageManager} run generate`,
    )}`;
    const openAiKeyConfigured = openAiKey || process.env["OPENAI_API_KEY"];
    const llamaCloudKeyConfigured = (dataSource?.config as FileSourceConfig)
      ?.useLlamaParse
      ? llamaCloudKey || process.env["LLAMA_CLOUD_API_KEY"]
      : true;
    const hasVectorDb = vectorDb && vectorDb !== "none";
    if (framework === "fastapi") {
      if (
        openAiKeyConfigured &&
        llamaCloudKeyConfigured &&
        !hasVectorDb &&
        isHavingPoetryLockFile()
      ) {
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
      if (openAiKeyConfigured && vectorDb === "none") {
        console.log(`Running ${runGenerate} to generate the context data.`);
        await callPackageManager(packageManager, true, ["run", "generate"]);
        return;
      }
    }

    const settings = [];
    if (!openAiKeyConfigured) settings.push("your OpenAI key");
    if (!llamaCloudKeyConfigured) settings.push("your Llama Cloud key");
    if (hasVectorDb) settings.push("your Vector DB environment variables");
    const settingsMessage =
      settings.length > 0 ? `After setting ${settings.join(" and ")}, ` : "";
    const generateMessage = `run ${runGenerate} to generate the context data.`;
    console.log(`\n${settingsMessage}${generateMessage}\n\n`);
  }
}

const copyContextData = async (
  root: string,
  dataSource?: TemplateDataSource,
) => {
  const destPath = path.join(root, "data");

  const dataSourceConfig = dataSource?.config as FileSourceConfig;

  // Copy file
  if (dataSource?.type === "file") {
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
  if (dataSource?.type === "folder") {
    const srcPath =
      dataSourceConfig.path ?? path.join(templatesDir, "components", "data");
    console.log(`\nCopying data to ${cyan(destPath)}\n`);
    await copy("**", destPath, {
      parents: true,
      cwd: srcPath,
    });
    return;
  }
};

const installCommunityProject = async ({
  root,
  communityProjectPath,
}: Pick<InstallTemplateArgs, "root" | "communityProjectPath">) => {
  console.log("\nInstalling community project:", communityProjectPath!);
  await downloadAndExtractRepo(root, {
    username: COMMUNITY_OWNER,
    name: COMMUNITY_REPO,
    branch: "main",
    filePath: communityProjectPath!,
  });
};

export const installTemplate = async (
  props: InstallTemplateArgs & { backend: boolean },
) => {
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
    await createBackendEnvFile(props.root, {
      openAiKey: props.openAiKey,
      llamaCloudKey: props.llamaCloudKey,
      vectorDb: props.vectorDb,
      model: props.model,
      embeddingModel: props.embeddingModel,
      framework: props.framework,
      dataSource: props.dataSource,
      port: props.externalPort,
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
          props.dataSource,
          props.llamaCloudKey,
        );
      }
    }
  } else {
    // this is a frontend for a full-stack app, create .env file with model information
    createFrontendEnvFile(props.root, {
      model: props.model,
      customApiPath: props.customApiPath,
    });
  }
};

export * from "./types";
