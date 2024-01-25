import path from "path";
import {
  LLAMA_PACK_CONFIG_PATH,
  LLAMA_PACK_OWNER,
  LLAMA_PACK_REPO,
} from "./constant";
import { copy } from "./copy";
import { downloadAndExtractRepo, getRepoRawContent } from "./repo";
import { InstallTemplateArgs } from "./types";

export async function getAvailableLlamapackOptions(): Promise<
  {
    name: string;
    folderPath: string;
    example: boolean | undefined;
  }[]
> {
  const libraryJson: any = await getRepoRawContent(LLAMA_PACK_CONFIG_PATH);
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
    __dirname,
    "..",
    "templates/components/sample-projects/llamapack",
  );
  await copy("**", root, {
    parents: true,
    cwd: templatePath,
  });
};

const installLlamapackExample = async ({
  root,
  llamapack,
}: Pick<InstallTemplateArgs, "root" | "llamapack">) => {
  const exampleFile = "example.py";
  const readmeFile = "README.md";

  try {
    await downloadAndExtractRepo(root, {
      username: LLAMA_PACK_OWNER,
      name: LLAMA_PACK_REPO,
      branch: "main",
      filePath: `${llamapack}/${exampleFile}`,
    });
    await downloadAndExtractRepo(root, {
      username: LLAMA_PACK_OWNER,
      name: LLAMA_PACK_REPO,
      branch: "main",
      filePath: `${llamapack}/${readmeFile}`,
    });
  } catch (error) {
    console.log("Error downloading Llamapack example:", error);
  }
};

export const installLlamapackProject = async ({
  root,
  llamapack,
}: Pick<InstallTemplateArgs, "root" | "llamapack">) => {
  console.log("\nInstalling Llamapack project:", llamapack!);
  await copyLlamapackEmptyProject({ root });
  await installLlamapackExample({ root, llamapack });
};
