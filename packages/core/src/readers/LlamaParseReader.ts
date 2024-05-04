import { defaultFS, getEnv, type GenericFileSystem } from "@llamaindex/env";
import { filetypemime } from "magic-bytes.js";
import { Document } from "../Node.js";
import type { Language, MultiReader, ResultType } from "./type.js";
import { SupportedFileTypes, SupportedMimeTypes } from "./utils.js";

/**
 * Represents a reader for parsing files using the LlamaParse API.
 * See https://github.com/run-llama/llama_parse
 */
export class LlamaParseReader implements MultiReader {
  // The API key for the LlamaParse API.
  apiKey: string;
  // The base URL of the Llama Parsing API.
  baseUrl: string = "https://api.cloud.llamaindex.ai/api/parsing";
  // The result type for the parser.
  resultType: ResultType = "text";
  // The number of workers to use sending API requests when parsing multiple files. Must be greater than 0 and less than 10.
  numWorkers: number = 4;
  // The interval in seconds to check if the parsing is done.
  checkInterval: number = 1;
  // The maximum timeout in seconds to wait for the parsing to finish.
  maxTimeout: number = 2000;
  // Whether to print the progress of the parsing.
  verbose: boolean = true;
  // Show progress when parsing multiple files.
  showProgress: boolean = true;
  // The language of the text to parse.
  language: Language = "en";
  // The parsing instruction for the parser.
  parsingInstruction: string = "";
  // Whether or not to ignore and skip errors raised during parsing.
  ignoreErrors: boolean = true;

  constructor(params: Partial<LlamaParseReader> = {}) {
    Object.assign(this, params);
    params.apiKey = params.apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
    if (!params.apiKey) {
      throw new Error(
        "API Key is required for LlamaParseReader. Please pass the apiKey parameter or set the LLAMA_CLOUD_API_KEY environment variable.",
      );
    }
    if (this.numWorkers < 1 || this.numWorkers > 9) {
      throw new Error(
        "The number of workers must be greater than 0 and less than 10.",
      );
    }

    this.apiKey = params.apiKey;
  }

  async loadData(file: string, fs?: GenericFileSystem): Promise<Document[]>;
  async loadData(
    files: string[],
    fs?: GenericFileSystem,
  ): Promise<Document[][]>;
  async loadData(
    files: string | string[],
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[] | Document[][]> {
    if (typeof files === "string") {
      // Single file
      return [await this.loadFile(files, fs)];
    } else {
      // Multiple files
      const results: Document[][] = [];
      for (let i = 0; i < files.length; i += this.numWorkers) {
        const batch = files.slice(i, i + this.numWorkers);
        const batchResults = await Promise.all(
          batch.map((file) => this.loadFile(file, fs)),
        );
        results.push(...batchResults);
        if (this.verbose && this.showProgress) {
          console.log(
            `Processed batch ${i / this.numWorkers + 1}/${Math.ceil(files.length / this.numWorkers)} (${(((i + this.numWorkers) / files.length) * 100).toFixed(2)}% complete).`,
          );
        }
      }
      if (this.verbose) {
        console.log("All files loaded successfully.");
      }
      return results;
    }
  }

  private async loadFile(
    file: string,
    fs: GenericFileSystem = defaultFS,
  ): Promise<Document[]> {
    const extension = `.${file
      .split(".")
      .pop()
      ?.trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .toLowerCase()}`;
    if (!SupportedFileTypes.includes(extension)) {
      throw new Error(
        `Unsupported file type: ${extension}. Supported types include: ${SupportedFileTypes.join(", ")}`,
      );
    }

    // Load data, set the mime type
    const data = await fs.readRawFile(file);
    const mimeType = await this.getMimeType(data);
    const metadata = { file_path: file };

    if (this.verbose) {
      console.log(`Starting load for file: ${file}`);
    }

    // Prepare the request body
    const body = new FormData();
    body.set("file", new Blob([data], { type: mimeType }), file);
    body.append("language", this.language);
    body.append("parsingInstruction", this.parsingInstruction);

    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    // Send the request, start job
    const url = `${this.baseUrl}/upload`;
    let response = await fetch(url, {
      signal: AbortSignal.timeout(this.maxTimeout * 1000),
      method: "POST",
      body,
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to parse the file: ${await response.text()}`);
    }
    const jsonResponse = await response.json();

    // Check the status of the job, return when done
    const jobId = jsonResponse.id;
    if (this.verbose) {
      console.log(`Started parsing the file under job id ${jobId}`);
    }

    const resultUrl = `${this.baseUrl}/job/${jobId}/result/${this.resultType}`;

    const start = Date.now();
    let tries = 0;
    while (true) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.checkInterval * 1000),
      );
      response = await fetch(resultUrl, {
        headers,
        signal: AbortSignal.timeout(this.maxTimeout * 1000),
      });

      if (!response.ok) {
        const end = Date.now();
        if (end - start > this.maxTimeout * 1000) {
          throw new Error(
            `Timeout while parsing the file: ${await response.text()}`,
          );
        }
        if (this.verbose && tries % 10 === 0) {
          process.stdout.write(".");
        }
        tries++;
        continue;
      }

      const resultJson = await response.json();
      return [
        new Document({
          text: resultJson[this.resultType],
          metadata: metadata,
        }),
      ];
    }
  }

  private async getMimeType(data: Buffer): Promise<string> {
    const mimes = filetypemime(data);
    const validMimes = mimes.find((mime) => SupportedMimeTypes.includes(mime));
    if (!validMimes) {
      throw new Error(
        `Unsupported file type. Supported types include: ${SupportedFileTypes.join(", ")}`,
      );
    }

    return validMimes;
  }
}
