import { copy } from "./copy";
import { callPackageManager } from "./install";

import fs from "fs/promises";
import path from "path";
import { cyan } from "picocolors";

import { COMMUNITY_OWNER, COMMUNITY_REPO } from "./constant";
import { templatesDir } from "./dir";
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
  WebSourceConfig,
} from "./types";
import { installTSTemplate } from "./typescript";

const createEnvLocalFile = async (
  root: string,
  opts?: {
    openAiKey?: string;
    llamaCloudKey?: string;
    vectorDb?: TemplateVectorDB;
    model?: string;
    embeddingModel?: string;
    framework?: TemplateFramework;
    dataSource?: TemplateDataSource;
  },
) => {
  const envFileName = ".env";
  let content = "";

  const model = opts?.model || "gpt-3.5-turbo";
  content += `MODEL=${model}\n`;
  if (opts?.framework === "nextjs") {
    content += `NEXT_PUBLIC_MODEL=${model}\n`;
  }
  console.log("\nUsing OpenAI model: ", model, "\n");

  if (opts?.openAiKey) {
    content += `OPENAI_API_KEY=${opts?.openAiKey}\n`;
  }

  if (opts?.embeddingModel) {
    content += `EMBEDDING_MODEL=${opts?.embeddingModel}\n`;
  }

  if ((opts?.dataSource?.config as FileSourceConfig).useLlamaParse) {
    if (opts?.llamaCloudKey) {
      content += `LLAMA_CLOUD_API_KEY=${opts?.llamaCloudKey}\n`;
    } else {
      content += `# Please obtain the Llama Cloud API key from https://cloud.llamaindex.ai/api-key 
# and set it to the LLAMA_CLOUD_API_KEY variable below.
# LLAMA_CLOUD_API_KEY=`;
    }
  }

  switch (opts?.vectorDb) {
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

  switch (opts?.dataSource?.type) {
    case "web": {
      const webConfig = opts?.dataSource.config as WebSourceConfig;
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
    await createEnvLocalFile(props.root, {
      openAiKey: props.openAiKey,
      llamaCloudKey: props.llamaCloudKey,
      vectorDb: props.vectorDb,
      model: props.model,
      embeddingModel: props.embeddingModel,
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
          props.dataSource,
          props.llamaCloudKey,
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
