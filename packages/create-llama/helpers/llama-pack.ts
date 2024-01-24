import got from "got";
import { LLAMA_PACK_CONFIG_PATH } from "./constant";
import { getRepoRawContent } from "./repo";

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
