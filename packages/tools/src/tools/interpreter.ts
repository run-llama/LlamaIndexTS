import { type Logs, Result, Sandbox } from "@e2b/code-interpreter";
import { tool } from "@llamaindex/core/tools";
import { randomUUID } from "@llamaindex/env";
import fs from "fs";
import path from "node:path";
import { z } from "zod";
import { getFileUrl, saveDocument } from "../helper";

export type InterpreterExtraType =
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

export type InterpreterToolOutput = {
  isError: boolean;
  logs: Logs;
  text?: string;
  extraResult: InterpreterExtraResult[];
  retryCount?: number;
};

export type InterpreterToolParams = {
  /** E2B API key required for authentication. Get yours at https://e2b.dev/docs/legacy/getting-started/api-key */
  apiKey: string;
  /** Directory where output files (charts, images, etc.) will be saved when code is executed */
  outputDir?: string;
  /** Local directory containing files that need to be uploaded to the sandbox environment before code execution */
  uploadedFilesDir?: string;
  /** Prefix for the file server URL */
  fileServerURLPrefix?: string;
};

export const interpreter = (params: InterpreterToolParams) => {
  const {
    apiKey,
    outputDir = path.join("output", "tools"),
    uploadedFilesDir = path.join("output", "uploaded"),
    fileServerURLPrefix = "/api/files",
  } = params;

  return tool({
    name: "interpreter",
    description:
      "Execute python code in a Jupyter notebook cell and return any result, stdout, stderr, display_data, and error.",
    parameters: z.object({
      code: z.string().describe("The python code to execute in a single cell"),
      retryCount: z
        .number()
        .default(0)
        .optional()
        .describe("The number of times the tool has been retried"),
    }),
    execute: async ({ code, retryCount = 0 }) => {
      if (retryCount >= 3) {
        return {
          isError: true,
          logs: { stdout: [], stderr: [] },
          text: "Max retries reached",
          extraResult: [],
        };
      }

      const interpreter = await Sandbox.create({ apiKey });
      await uploadFilesToSandbox(interpreter, uploadedFilesDir);
      const exec = await interpreter.runCode(code);
      const extraResult = await getExtraResult(
        outputDir,
        exec.results[0],
        fileServerURLPrefix,
      );

      return {
        isError: !!exec.error,
        logs: exec.logs,
        text: exec.text,
        extraResult,
        retryCount: retryCount + 1,
      } as InterpreterToolOutput;
    },
  });
};

async function uploadFilesToSandbox(
  codeInterpreter: Sandbox,
  uploadedFilesDir: string,
) {
  try {
    const sandboxFiles = fs.readdirSync(uploadedFilesDir);
    for (const filePath of sandboxFiles) {
      const fileName = path.basename(filePath);
      const localFilePath = path.join(uploadedFilesDir, fileName);
      const content = fs.readFileSync(localFilePath);
      const arrayBuffer = new Uint8Array(content).buffer;
      await codeInterpreter.files.write(filePath, arrayBuffer);
    }
  } catch (error) {
    console.error("Got error when uploading files to sandbox", error);
  }
}

async function getExtraResult(
  outputDir: string,
  res?: Result,
  fileServerURLPrefix?: string,
): Promise<InterpreterExtraResult[]> {
  if (!res) return [];
  const output: InterpreterExtraResult[] = [];

  try {
    const formats = res.formats();
    const results = formats.map((f) => res[f as keyof Result]);

    for (let i = 0; i < formats.length; i++) {
      const ext = formats[i];
      const data = results[i];
      switch (ext) {
        case "png":
        case "jpeg":
        case "svg":
        case "pdf": {
          const { filename, filePath } = await saveToDisk(outputDir, data, ext);
          const fileUrl = getFileUrl(filePath, { fileServerURLPrefix });
          output.push({
            type: ext as InterpreterExtraType,
            filename,
            url: fileUrl,
          });
          break;
        }
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

async function saveToDisk(outputDir: string, base64Data: string, ext: string) {
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(base64Data, "base64");
  const filePath = path.join(outputDir, filename);
  await saveDocument(filePath, buffer);
  return { filename, filePath };
}
