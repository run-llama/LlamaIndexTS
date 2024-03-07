import asc from "assemblyscript/bin/asc";
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
    const { error, stdout, stderr } = await asc.main([
      `assembly/tools/${toolId}/index.ts`,
      "--outFile",
      `${storageDir}/${toolId}.wasm`,
      "--optimize",
      "--sourceMap",
      "--stats",
    ]);
    if (error) {
      console.log("Download failed: " + error.message);
      console.log(stderr.toString());
    } else {
      console.log(stdout.toString());
    }
  }

  async loadTool(filePath: string): Promise<BaseTool> {
    const mod = new WebAssembly.Module(fs.readFileSync(filePath));
    const ins = new WebAssembly.Instance(mod);
    return ins.exports as unknown as BaseTool;
  }
}
