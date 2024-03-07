import { execSync } from "child_process";
import fs from "fs";
import { BaseTool } from "./assembly/base";

type ToolInfo = {
  id: string;
  name: string;
};

export interface IToolFactory {
  getToolList(): ToolInfo[];
  downloadTool(toolId: string, storageDir?: string): void;
  loadTool(filePath: string): Promise<BaseTool>;
}

export default class ToolFactory implements IToolFactory {
  getToolList(): ToolInfo[] {
    return [
      {
        id: "query-engine-tool",
        name: "Query Engine Tool",
      },
      {
        id: "wiki-tool",
        name: "Wikipedia Summary",
      },
    ];
  }

  async downloadTool(toolId: string, storageDir: string = "build") {
    try {
      execSync(
        `asc assembly/tools/${toolId}/index.ts -o ${storageDir}/${toolId}.wasm -t ${storageDir}/${toolId}.wat --target release`,
      );
      console.log(`Module ${toolId} downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading module ${toolId}:`, error.message);
    }
  }

  async loadTool(filePath: string): Promise<BaseTool> {
    const mod = new WebAssembly.Module(fs.readFileSync(filePath));
    const ins = new WebAssembly.Instance(mod);
    return ins.exports as unknown as BaseTool;
  }
}
