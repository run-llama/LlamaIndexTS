import { fs, getEnv } from "@llamaindex/env";
import { filetypemime } from "magic-bytes.js";
import { Document } from "../Node.js";
import type { FileReader, Language, ResultType } from "./type.js";

const SupportedFiles: { [key: string]: string } = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".docm": "application/vnd.ms-word.document.macroEnabled.12",
  ".dot": "application/msword",
  ".dotx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  ".dotm": "application/vnd.ms-word.template.macroEnabled.12",
  ".rtf": "application/rtf",
  ".wps": "application/vnd.ms-works",
  ".wpd": "application/wordperfect",
  ".sxw": "application/vnd.sun.xml.writer",
  ".stw": "application/vnd.sun.xml.writer.template",
  ".sxg": "application/vnd.sun.xml.writer.global",
  ".pages": "application/x-iwork-pages-sffpages",
  ".mw": "application/macwriteii",
  ".mcw": "application/macwriteii",
  ".uot": "application/x-uo",
  ".uof": "application/vnd.uoml+xml",
  ".uos": "application/vnd.sun.xml.calc",
  ".uop": "application/vnd.openofficeorg.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".pot": "application/vnd.ms-powerpoint",
  ".pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  ".potx":
    "application/vnd.openxmlformats-officedocument.presentationml.template",
  ".potm": "application/vnd.ms-powerpoint.template.macroEnabled.12",
  ".key": "application/x-iwork-keynote-sffkey",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".odg": "application/vnd.oasis.opendocument.graphics",
  ".otp": "application/vnd.oasis.opendocument.presentation-template",
  ".fopd": "application/vnd.oasis.opendocument.presentation",
  ".sxi": "application/vnd.sun.xml.impress",
  ".sti": "application/vnd.sun.xml.impress.template",
  ".epub": "application/epub+zip",
  ".html": "text/html",
  ".htm": "text/html",
};

/**
 * Represents a reader for parsing files using the LlamaParse API.
 * See https://github.com/run-llama/llama_parse
 */
export class LlamaParseReader implements FileReader {
  // The API key for the LlamaParse API.
  apiKey: string;
  // The base URL of the Llama Parsing API.
  baseUrl: string = "https://api.cloud.llamaindex.ai/api/parsing";
  // The maximum timeout in seconds to wait for the parsing to finish.
  maxTimeout = 2000;
  // The interval in seconds to check if the parsing is done.
  checkInterval = 1;
  // Whether to print the progress of the parsing.
  verbose = true;
  // The result type for the parser.
  resultType: ResultType = "text";
  // The language of the text to parse.
  language: Language = "en";
  // The parsing instruction for the parser.
  parsingInstruction: string = "";
  // If set to true, the parser will ignore diagonal text (when the text rotation in degrees modulo 90 is not 0).
  skipDiagonalText: boolean = false;
  // If set to true, the cache will be ignored and the document re-processes. All document are kept in cache for 48hours after the job was completed to avoid processing 2 time the same document.
  invalidateCache: boolean = false;
  // Whether to use gpt-4o extract text from documents.
  gpt4oMode: boolean = false;
  // The API key for the GPT-4o API. Lowers the cost of parsing.
  gpt4oApiKey?: string;

  constructor(params: Partial<LlamaParseReader> = {}) {
    Object.assign(this, params);
    params.apiKey = params.apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
    if (!params.apiKey) {
      throw new Error(
        "API Key is required for LlamaParseReader. Please pass the apiKey parameter or set the LLAMA_CLOUD_API_KEY environment variable.",
      );
    }
    this.apiKey = params.apiKey;

    if (params.gpt4oMode) {
      params.gpt4oApiKey =
        params.gpt4oApiKey ?? getEnv("LLAMA_CLOUD_GPT4O_API_KEY");
      if (!params.gpt4oApiKey) {
        throw new Error(
          "LlamaParse: GPT-4o Mode is enabled but no API Key provided. Please pass the gpt4oApiKey parameter or set the LLAMA_CLOUD_GPT4O_API_KEY environment variable.",
        );
      }
      this.gpt4oApiKey = params.gpt4oApiKey;
    }
  }

  async loadData(file: string): Promise<Document[]> {
    const metadata = { file_path: file };

    // Load data, set the mime type
    const data = await fs.readFile(file);
    const mimeType = await this.getMimeType(data);

    const body = new FormData();
    body.set("file", new Blob([data], { type: mimeType }), file);
    body.append("language", this.language);
    body.append("parsing_instruction", this.parsingInstruction);
    body.append("skip_diagonal_text", this.skipDiagonalText.toString());
    body.append("invalidate_cache", this.invalidateCache.toString());
    body.append("gpt4o_mode", this.gpt4oMode.toString());
    if (this.gpt4oMode && this.gpt4oApiKey) {
      body.append("gpt4o_api_key", this.gpt4oApiKey);
    }

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
    const validMime = mimes.find((mime) =>
      Object.values(SupportedFiles).includes(mime),
    );
    if (!validMime) {
      const supportedExtensions = Object.keys(SupportedFiles).join(", ");
      throw new Error(
        `File has type "${mimes}" which does not match supported MIME Types. Supported formats include: ${supportedExtensions}`,
      );
    }

    return validMime;
  }
}
