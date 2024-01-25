import got from "got";
import path from "path";
import {
  LLAMA_PACK_CONFIG_PATH,
  LLAMA_PACK_OWNER,
  LLAMA_PACK_REPO,
} from "./constant";
import { copy } from "./copy";
import { downloadAndExtractRepo, getRepoRawContent } from "./repo";
import { InstallTemplateArgs } from "./types";

async function getLlamapackFolders(): Promise<string[]> {
  const libraryJson: any = await getRepoRawContent(LLAMA_PACK_CONFIG_PATH);
  const llamapackIds = Object.keys(libraryJson);
  return llamapackIds.map((id) => libraryJson[id].id);
}

interface ExampleFile {
  name: string;
  file_path: string;
  type: "file" | "dir";
}

/**
 * This function returns a list of available examples from the llama pack library.
 * They are returned as a list of ExampleFile objects. (valid when having example.py)
 */
export async function getAvailableLlamapackExamples(): Promise<ExampleFile[]> {
  const exampleFileName = "example.py";
  const llamapackFolderPath = "run-llama/llama-hub/contents/llama_hub";
  const result: ExampleFile[] = [];

  const folders = await getLlamapackFolders();
  for (const folder of folders) {
    const url = `https://api.github.com/repos/${llamapackFolderPath}/${folder}`;
    const response = await got(url, {
      responseType: "json",
    });
    const data = response.body as ExampleFile[];
    const exampleFile = data.find(
      (item) => item.name === exampleFileName && item.type === "file",
    );
    if (exampleFile) {
      result.push(exampleFile);
    }
  }

  return result;
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

const installLlamapackExampleFile = async ({
  root,
  llamapack,
}: Pick<InstallTemplateArgs, "root" | "llamapack">) => {
  console.log("\nInstalling Llamapack project:", llamapack!);
  await downloadAndExtractRepo(root, {
    username: LLAMA_PACK_OWNER,
    name: LLAMA_PACK_REPO,
    branch: "main",
    filePath: llamapack!,
  });
};

export const installLlamapackProject = async ({
  root,
  llamapack,
}: Pick<InstallTemplateArgs, "root" | "llamapack">) => {
  await copyLlamapackEmptyProject({ root });
  await installLlamapackExampleFile({ root, llamapack });
};
