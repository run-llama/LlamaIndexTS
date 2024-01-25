import { copy } from "./copy";
import { callPackageManager } from "./install";

import fs from "fs/promises";
import path from "path";
import { cyan } from "picocolors";

import { COMMUNITY_OWNER, COMMUNITY_REPO } from "./constant";
import { PackageManager } from "./get-pkg-manager";
import { isHavingPoetryLockFile, tryPoetryRun } from "./poetry";
import { installPythonTemplate } from "./python";
import { downloadAndExtractRepo } from "./repo";
import {
  InstallTemplateArgs,
  TemplateEngine,
  TemplateFramework,
  TemplateVectorDB,
} from "./types";
import { installTSTemplate } from "./typescript";

const createEnvLocalFile = async (
  root: string,
  opts?: {
    openAiKey?: string;
    vectorDb?: TemplateVectorDB;
    model?: string;
    framework?: TemplateFramework;
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
  }

  if (content) {
    await fs.writeFile(path.join(root, envFileName), content);
    console.log(`Created '${envFileName}' file. Please check the settings.`);
  }
};

const copyTestData = async (
  root: string,
  framework: TemplateFramework,
  packageManager?: PackageManager,
  engine?: TemplateEngine,
  openAiKey?: string,
  vectorDb?: TemplateVectorDB,
  contextFile?: string,
  // eslint-disable-next-line max-params
) => {
  if (engine === "context") {
    const destPath = path.join(root, "data");
    if (contextFile) {
      console.log(`\nCopying provided file to ${cyan(destPath)}\n`);
      await fs.mkdir(destPath, { recursive: true });
      await fs.copyFile(
        contextFile,
        path.join(destPath, path.basename(contextFile)),
      );
    } else {
      const srcPath = path.join(
        __dirname,
        "..",
        "templates",
        "components",
        "data",
      );
      console.log(`\nCopying test data to ${cyan(destPath)}\n`);
      await copy("**", destPath, {
        parents: true,
        cwd: srcPath,
      });
    }
  }

  if (packageManager && engine === "context") {
    const runGenerate = `${cyan(
      framework === "fastapi"
        ? "poetry run python app/engine/generate.py"
        : `${packageManager} run generate`,
    )}`;
    const hasOpenAiKey = openAiKey || process.env["OPENAI_API_KEY"];
    const hasVectorDb = vectorDb && vectorDb !== "none";
    if (framework === "fastapi") {
      if (hasOpenAiKey && vectorDb === "none" && isHavingPoetryLockFile()) {
        console.log(`Running ${runGenerate} to generate the context data.`);
        tryPoetryRun("python app/engine/generate.py");
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
    });

    // Copy test pdf file
    await copyTestData(
      props.root,
      props.framework,
      props.packageManager,
      props.engine,
      props.openAiKey,
      props.vectorDb,
      props.contextFile,
    );
  } else {
    // this is a frontend for a full-stack app, create .env file with model information
    const content = `MODEL=${props.model}\nNEXT_PUBLIC_MODEL=${props.model}\n`;
    await fs.writeFile(path.join(props.root, ".env"), content);
  }
};

export * from "./types";
