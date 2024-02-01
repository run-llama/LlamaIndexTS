import fs from "fs/promises";
import path from "path";
import { LLAMA_HUB_FOLDER_PATH, LLAMA_PACK_CONFIG_PATH } from "./constant";
import { copy } from "./copy";
import { templatesDir } from "./dir";
import { installPythonDependencies } from "./python";
import { getRepoRawContent } from "./repo";
import { InstallTemplateArgs } from "./types";

export async function getAvailableLlamapackOptions(): Promise<
  {
    name: string;
    folderPath: string;
    example: boolean | undefined;
  }[]
> {
  const libraryJsonRaw = await getRepoRawContent(LLAMA_PACK_CONFIG_PATH);
  const libraryJson = JSON.parse(libraryJsonRaw);
  const llamapackKeys = Object.keys(libraryJson);
  return llamapackKeys
    .map((key) => ({
      name: key,
      folderPath: libraryJson[key].id,
      example: libraryJson[key].example,
    }))
    .filter((item) => !!item.example);
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
  const exampleFilePath = `${LLAMA_HUB_FOLDER_PATH}/${llamapack}/${exampleFileName}`;
  const readmeFilePath = `${LLAMA_HUB_FOLDER_PATH}/${llamapack}/${readmeFileName}`;

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
