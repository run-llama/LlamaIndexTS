import { Logs, Result, Sandbox } from "@e2b/code-interpreter";
import type { JSONSchemaType } from "ajv";
import fs from "fs";
import { BaseTool, ToolMetadata } from "llamaindex";
import crypto from "node:crypto";
import path from "node:path";

export type InterpreterParameter = {
  code: string;
  sandboxFiles?: string[];
  retryCount?: number;
};

export type InterpreterToolParams = {
  metadata?: ToolMetadata<JSONSchemaType<InterpreterParameter>>;
  apiKey?: string;
  fileServerURLPrefix?: string;
};

export type InterpreterToolOutput = {
  isError: boolean;
  logs: Logs;
  text?: string;
  extraResult: InterpreterExtraResult[];
  retryCount?: number;
};

type InterpreterExtraType =
  | "html"
  | "markdown"
  | "svg"
  | "png"
  | "jpeg"
  | "pdf"
  | "latex"
  | "json"
  | "javascript";

export type InterpreterExtraResult = {
  type: InterpreterExtraType;
  content?: string;
  filename?: string;
  url?: string;
};

const DEFAULT_META_DATA: ToolMetadata<JSONSchemaType<InterpreterParameter>> = {
  name: "interpreter",
  description: `Execute python code in a Jupyter notebook cell and return any result, stdout, stderr, display_data, and error.
If the code needs to use a file, ALWAYS pass the file path in the sandbox_files argument.
You have a maximum of 3 retries to get the code to run successfully.
`,
  parameters: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "The python code to execute in a single cell.",
      },
      sandboxFiles: {
        type: "array",
        description:
          "List of local file paths to be used by the code. The tool will throw an error if a file is not found.",
        items: {
          type: "string",
        },
        nullable: true,
      },
      retryCount: {
        type: "number",
        description: "The number of times the tool has been retried",
        default: 0,
        nullable: true,
      },
    },
    required: ["code"],
  },
};

export class InterpreterTool implements BaseTool<InterpreterParameter> {
  private readonly outputDir = "output/tools";
  private readonly uploadedFilesDir = "output/uploaded";
  private apiKey?: string;
  private fileServerURLPrefix?: string;
  metadata: ToolMetadata<JSONSchemaType<InterpreterParameter>>;
  codeInterpreter?: Sandbox;

  constructor(params?: InterpreterToolParams) {
    this.metadata = params?.metadata || DEFAULT_META_DATA;
    this.apiKey = params?.apiKey || process.env.E2B_API_KEY;
    this.fileServerURLPrefix =
      params?.fileServerURLPrefix || process.env.FILESERVER_URL_PREFIX;

    if (!this.apiKey) {
      throw new Error(
        "E2B_API_KEY key is required to run code interpreter. Get it here: https://e2b.dev/docs/getting-started/api-key",
      );
    }
    if (!this.fileServerURLPrefix) {
      throw new Error(
        "FILESERVER_URL_PREFIX is required to display file output from sandbox",
      );
    }
  }

  public async initInterpreter(input: InterpreterParameter) {
    if (!this.codeInterpreter) {
      this.codeInterpreter = await Sandbox.create({
        apiKey: this.apiKey,
      });
      // upload files to sandbox when it's initialized
      if (input.sandboxFiles) {
        console.log(`Uploading ${input.sandboxFiles.length} files to sandbox`);
        try {
          for (const filePath of input.sandboxFiles) {
            const fileName = path.basename(filePath);
            const localFilePath = path.join(this.uploadedFilesDir, fileName);
            const content = fs.readFileSync(localFilePath);

            const arrayBuffer = new Uint8Array(content).buffer;
            await this.codeInterpreter?.files.write(filePath, arrayBuffer);
          }
        } catch (error) {
          console.error("Got error when uploading files to sandbox", error);
        }
      }
    }

    return this.codeInterpreter;
  }

  public async codeInterpret(
    input: InterpreterParameter,
  ): Promise<InterpreterToolOutput> {
    console.log(
      `Sandbox files: ${input.sandboxFiles}. Retry count: ${input.retryCount}`,
    );

    if (input.retryCount && input.retryCount >= 3) {
      return {
        isError: true,
        logs: {
          stdout: [],
          stderr: [],
        },
        text: "Max retries reached",
        extraResult: [],
      };
    }

    console.log(
      `\n${"=".repeat(50)}\n> Running following AI-generated code:\n${input.code}\n${"=".repeat(50)}`,
    );
    const interpreter = await this.initInterpreter(input);
    const exec = await interpreter.runCode(input.code);
    if (exec.error) console.error("[Code Interpreter error]", exec.error);
    const extraResult = await this.getExtraResult(exec.results[0]);
    const result: InterpreterToolOutput = {
      isError: !!exec.error,
      logs: exec.logs,
      text: exec.text,
      extraResult,
      retryCount: input.retryCount ? input.retryCount + 1 : 1,
    };
    return result;
  }

  async call(input: InterpreterParameter): Promise<InterpreterToolOutput> {
    const result = await this.codeInterpret(input);
    return result;
  }

  async close() {
    await this.codeInterpreter?.kill();
  }

  private async getExtraResult(
    res?: Result,
  ): Promise<InterpreterExtraResult[]> {
    if (!res) return [];
    const output: InterpreterExtraResult[] = [];

    try {
      const formats = res.formats(); // formats available for the result. Eg: ['png', ...]
      const results = formats.map((f) => res[f as keyof Result]); // get base64 data for each format

      // save base64 data to file and return the url
      for (let i = 0; i < formats.length; i++) {
        const ext = formats[i];
        const data = results[i];
        switch (ext) {
          case "png":
          case "jpeg":
          case "svg":
          case "pdf":
            const { filename } = this.saveToDisk(data, ext);
            output.push({
              type: ext as InterpreterExtraType,
              filename,
              url: this.getFileUrl(filename),
            });
            break;
          default:
            output.push({
              type: ext as InterpreterExtraType,
              content: data,
            });
            break;
        }
      }
    } catch (error) {
      console.error("Error when parsing e2b response", error);
    }

    return output;
  }

  // Consider saving to cloud storage instead but it may cost more for you
  // See: https://e2b.dev/docs/sandbox/api/filesystem#write-to-file
  private saveToDisk(
    base64Data: string,
    ext: string,
  ): {
    outputPath: string;
    filename: string;
  } {
    const filename = `${crypto.randomUUID()}.${ext}`; // generate a unique filename
    const buffer = Buffer.from(base64Data, "base64");
    const outputPath = this.getOutputPath(filename);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved file to ${outputPath}`);
    return {
      outputPath,
      filename,
    };
  }

  private getOutputPath(filename: string): string {
    // if outputDir doesn't exist, create it
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    return path.join(this.outputDir, filename);
  }

  private getFileUrl(filename: string): string {
    return `${this.fileServerURLPrefix}/${this.outputDir}/${filename}`;
  }
}
