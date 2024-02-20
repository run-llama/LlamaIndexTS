import fs from "fs/promises";
import got from "got";
import path from "path";
import { parse } from "smol-toml";
import {
  LLAMA_PACK_FOLDER,
  LLAMA_PACK_FOLDER_PATH,
  LLAMA_PACK_OWNER,
  LLAMA_PACK_REPO,
} from "./constant";
import { copy } from "./copy";
import { templatesDir } from "./dir";
import { addDependencies, installPythonDependencies } from "./python";
import { getRepoRawContent } from "./repo";
import { InstallTemplateArgs } from "./types";

const getLlamaPackFolderSHA = async () => {
  const url = `https://api.github.com/repos/${LLAMA_PACK_OWNER}/${LLAMA_PACK_REPO}/contents`;
  const response = await got(url, {
    responseType: "json",
  });
  const data = response.body as any[];
  const llamaPackFolder = data.find((item) => item.name === LLAMA_PACK_FOLDER);
  return llamaPackFolder.sha;
};

const getLLamaPackFolderTree = async (
  sha: string,
): Promise<
  Array<{
    path: string;
  }>
> => {
  const url = `https://api.github.com/repos/${LLAMA_PACK_OWNER}/${LLAMA_PACK_REPO}/git/trees/${sha}?recursive=1`;
  const response = await got(url, {
    responseType: "json",
  });
  return (response.body as any).tree;
};

export async function getAvailableLlamapackOptions(): Promise<
  {
    name: string;
    folderPath: string;
  }[]
> {
  const EXAMPLE_RELATIVE_PATH = "/examples/example.py";
  const PACK_FOLDER_SUBFIX = "llama-index-packs";

  const llamaPackFolderSHA = await getLlamaPackFolderSHA();
  const llamaPackTree = await getLLamaPackFolderTree(llamaPackFolderSHA);

  // Return options that have example files
  const exampleFiles = llamaPackTree.filter((item) =>
    item.path.endsWith(EXAMPLE_RELATIVE_PATH),
  );
  const options = exampleFiles.map((file) => {
    const packFolder = file.path.substring(
      0,
      file.path.indexOf(EXAMPLE_RELATIVE_PATH),
    );
    const packName = packFolder.substring(PACK_FOLDER_SUBFIX.length + 1);
    return {
      name: packName,
      folderPath: packFolder,
    };
  });
  return options;
}

const copyLlamapackEmptyProject = async ({
  root,
}: Pick<InstallTemplateArgs, "root">) => {
  const templatePath = path.join(
    templatesDir,
    "components/sample-projects/llamapack",
  );
  await copy("**", root, {
    parents: true,
    cwd: templatePath,
  });
};

const copyData = async ({
  root,
}: Pick<InstallTemplateArgs, "root" | "llamapack">) => {
  const dataPath = path.join(templatesDir, "components/data");
  await copy("**", path.join(root, "data"), {
    parents: true,
    cwd: dataPath,
  });
};

const installLlamapackExample = async ({
  root,
  llamapack,
}: Pick<InstallTemplateArgs, "root" | "llamapack">) => {
  const exampleFileName = "example.py";
  const readmeFileName = "README.md";
  const projectTomlFileName = "pyproject.toml";
  const exampleFilePath = `${LLAMA_PACK_FOLDER_PATH}/${llamapack}/examples/${exampleFileName}`;
  const readmeFilePath = `${LLAMA_PACK_FOLDER_PATH}/${llamapack}/${readmeFileName}`;
  const projectTomlFilePath = `${LLAMA_PACK_FOLDER_PATH}/${llamapack}/${projectTomlFileName}`;

  // Download example.py from llamapack and save to root
  const exampleContent = await getRepoRawContent(exampleFilePath);
  await fs.writeFile(path.join(root, exampleFileName), exampleContent);

  // Download README.md from llamapack and combine with README-template.md,
  // save to root and then delete template file
  const readmeContent = await getRepoRawContent(readmeFilePath);
  const readmeTemplateContent = await fs.readFile(
    path.join(root, "README-template.md"),
    "utf-8",
  );
  await fs.writeFile(
    path.join(root, readmeFileName),
    `${readmeContent}\n${readmeTemplateContent}`,
  );
  await fs.unlink(path.join(root, "README-template.md"));

  // Download pyproject.toml from llamapack, parse it to get package name and version,
  // then add it as a dependency to current toml file in the project
  const projectTomlContent = await getRepoRawContent(projectTomlFilePath);
  const fileParsed = parse(projectTomlContent) as any;
  const packageName = fileParsed.tool.poetry.name;
  const packageVersion = fileParsed.tool.poetry.version;
  await addDependencies(root, [
    {
      name: packageName,
      version: packageVersion,
    },
  ]);
};

export const installLlamapackProject = async ({
  root,
  llamapack,
  postInstallAction,
}: Pick<InstallTemplateArgs, "root" | "llamapack" | "postInstallAction">) => {
  console.log("\nInstalling Llamapack project:", llamapack!);
  await copyLlamapackEmptyProject({ root });
  await copyData({ root });
  await installLlamapackExample({ root, llamapack });
  if (postInstallAction !== "none") {
    installPythonDependencies({ noRoot: true });
  }
};
