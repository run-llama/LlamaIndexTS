import { fs, getEnv } from "@llamaindex/env";
import { filetypemime } from "magic-bytes.js";
import { Document } from "../Node.js";
import type { FileReader, Language, ResultType } from "./type.js";

const SupportedFiles: { [key: string]: string } = {
  ".pdf": "application/pdf",
  // Documents and Presentations
  ".602": "application/x-t602",
  ".abw": "application/x-abiword",
  ".cgm": "image/cgm",
  ".cwk": "application/x-cwk",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".docm": "application/vnd.ms-word.document.macroEnabled.12",
  ".dot": "application/msword",
  ".dotm": "application/vnd.ms-word.template.macroEnabled.12",
  ".dotx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  ".hwp": "application/x-hwp",
  ".key": "application/x-iwork-keynote-sffkey",
  ".lwp": "application/vnd.lotus-wordpro",
  ".mw": "application/macwriteii",
  ".mcw": "application/macwriteii",
  ".pages": "application/x-iwork-pages-sffpages",
  ".pbd": "application/x-pagemaker",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".pot": "application/vnd.ms-powerpoint",
  ".potm": "application/vnd.ms-powerpoint.template.macroEnabled.12",
  ".potx":
    "application/vnd.openxmlformats-officedocument.presentationml.template",
  ".rtf": "application/rtf",
  ".sda": "application/vnd.stardivision.draw",
  ".sdd": "application/vnd.stardivision.impress",
  ".sdp": "application/sdp",
  ".sdw": "application/vnd.stardivision.writer",
  ".sgl": "application/vnd.stardivision.writer",
  ".sti": "application/vnd.sun.xml.impress.template",
  ".sxi": "application/vnd.sun.xml.impress",
  ".sxw": "application/vnd.sun.xml.writer",
  ".stw": "application/vnd.sun.xml.writer.template",
  ".sxg": "application/vnd.sun.xml.writer.global",
  ".txt": "text/plain",
  ".uof": "application/vnd.uoml+xml",
  ".uop": "application/vnd.openofficeorg.presentation",
  ".uot": "application/x-uo",
  ".vor": "application/vnd.stardivision.writer",
  ".wpd": "application/wordperfect",
  ".wps": "application/vnd.ms-works",
  ".xml": "application/xml",
  ".zabw": "application/x-abiword",
  // Images
  ".epub": "application/epub+zip",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".tiff": "image/tiff",
  ".webp": "image/webp",
  // Web
  ".htm": "text/html",
  ".html": "text/html",
  // Spreadsheets
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
  ".xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
  ".xlw": "application/vnd.ms-excel",
  ".csv": "text/csv",
  ".dif": "application/x-dif",
  ".sylk": "text/vnd.sylk",
  ".slk": "text/vnd.sylk",
  ".prn": "application/x-prn",
  ".numbers": "application/x-iwork-numbers-sffnumbers",
  ".et": "application/vnd.ms-excel",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".fods": "application/vnd.oasis.opendocument.spreadsheet",
  ".uos1": "application/vnd.uoml+xml",
  ".uos2": "application/vnd.uoml+xml",
  ".dbf": "application/vnd.dbf",
  ".wk1": "application/vnd.lotus-1-2-3",
  ".wk2": "application/vnd.lotus-1-2-3",
  ".wk3": "application/vnd.lotus-1-2-3",
  ".wk4": "application/vnd.lotus-1-2-3",
  ".wks": "application/vnd.lotus-1-2-3",
  ".123": "application/vnd.lotus-1-2-3",
  ".wq1": "application/x-lotus",
  ".wq2": "application/x-lotus",
  ".wb1": "application/x-quattro-pro",
  ".wb2": "application/x-quattro-pro",
  ".wb3": "application/x-quattro-pro",
  ".qpw": "application/x-quattro-pro",
  ".xlr": "application/vnd.ms-works",
  ".eth": "application/ethos",
  ".tsv": "text/tab-separated-values",
};

/**
 * Represents a reader for parsing files using the LlamaParse API.
 * See https://github.com/run-llama/llama_parse
 */
export class LlamaParseReader implements FileReader {
  // The API key for the LlamaParse API. Can be set as an environment variable: LLAMA_CLOUD_API_KEY
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
  // If set to true, the cache will be ignored and the document re-processes. All document are kept in cache for 48hours after the job was completed to avoid processing the same document twice.
  invalidateCache: boolean = false;
  // Whether to use gpt-4o to extract text from documents.
  gpt4oMode: boolean = false;
  // The API key for the GPT-4o API. Optional, lowers the cost of parsing. Can be set as an env variable: LLAMA_CLOUD_GPT4O_API_KEY.
  gpt4oApiKey?: string;
  // numWorkers is implemented in SimpleDirectoryReader

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

      this.gpt4oApiKey = params.gpt4oApiKey;
    }
  }

  // Create a job for the LlamaParse API
  private async createJob(file: string): Promise<string> {
    // Load data, set the mime type
    const data = await fs.readFile(file);
    const mimeType = await this.getMimeType(data);

    if (this.verbose) {
      console.log(`Starting load for file: ${file}`);
    }

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
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.maxTimeout * 1000),
      method: "POST",
      body,
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to parse the file: ${await response.text()}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse.id;
  }

  // Get the result of the job
  private async getJobResult(jobId: string, resultType: string): Promise<any> {
    const resultUrl = `${this.baseUrl}/job/${jobId}/result/${resultType}`;
    const statusUrl = `${this.baseUrl}/job/${jobId}`;
    const headers = { Authorization: `Bearer ${this.apiKey}` };

    const signal = AbortSignal.timeout(this.maxTimeout * 1000);
    let tries = 0;
    while (true) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.checkInterval * 1000),
      );

      // Check the job status. If unsuccessful response, checks if maximum timeout has been reached. If reached, throws an error
      const statusResponse = await fetch(statusUrl, {
        headers,
        signal,
      });
      if (!statusResponse.ok) {
        signal.throwIfAborted();
        if (this.verbose && tries % 10 === 0) {
          process.stdout.write(".");
        }
        tries++;
        continue;
      }

      // If response is succesful, check status of job. Allowed values "PENDING", "SUCCESS", "ERROR", "CANCELED"
      const statusJson = await statusResponse.json();
      const status = statusJson.status;
      // If job has completed, return the result
      if (status === "SUCCESS") {
        const resultResponse = await fetch(resultUrl, {
          headers,
          signal,
        });
        if (!resultResponse.ok) {
          throw new Error(
            `Failed to fetch result: ${await resultResponse.text()}`,
          );
        }
        return resultResponse.json();
        // If job is still pending, check if maximum timeout has been reached. If reached, throws an error
      } else if (status === "PENDING") {
        signal.throwIfAborted();
        if (this.verbose && tries % 10 === 0) {
          process.stdout.write(".");
        }
        tries++;
      } else {
        throw new Error(
          `Failed to parse the file: ${jobId}, status: ${status}`,
        );
      }
    }
  }

  /**
   * Loads data from a file and returns an array of Document objects.
   * To be used with resultType = "text" and "markdown"
   *
   * @param {string} file - The path to the file to be loaded.
   * @return {Promise<Document[]>} A Promise object that resolves to an array of Document objects.
   */
  async loadData(file: string): Promise<Document[]> {
    // Set metadata to contain file_path
    const metadata = { file_path: file };

    // Creates a job for the file
    const jobId = await this.createJob(file);
    if (this.verbose) {
      console.log(`Started parsing the file under job id ${jobId}`);
    }

    // Return results as Document objects
    const resultJson = await this.getJobResult(jobId, this.resultType);
    return [
      new Document({
        text: resultJson[this.resultType],
        metadata: metadata,
      }),
    ];
  }
  /**
   * Loads data from a file and returns its contents as a JSON object.
   * To be used with resultType = "json"
   *
   * @param {string} file - The path to the file to be loaded.
   * @return {Promise<Record<string, any>>} A Promise that resolves to the JSON object.
   */
  async loadJson(file: string): Promise<Record<string, any>> {
    // Creates a job for the file
    const jobId = await this.createJob(file);
    if (this.verbose) {
      console.log(`Started parsing the file under job id ${jobId}`);
    }

    // Return results as JSON object
    const resultJson = await this.getJobResult(jobId, "json");
    resultJson.job_id = jobId;
    resultJson.file_path = file;
    return resultJson;
  }

  /**
   * Downloads and saves images from a given JSON result to a specified download path.
   * Currently only supports resultType = "json"
   *
   * @param {Record<string, any>[]} jsonResult - The JSON result containing image information.
   * @param {string} downloadPath - The path to save the downloaded images.
   * @return {Promise<Record<string, any>[]>} A Promise that resolves to an array of image objects.
   */
  async getImages(
    jsonResult: Record<string, any>[],
    downloadPath: string,
  ): Promise<Record<string, any>[]> {
    const headers = { Authorization: `Bearer ${this.apiKey}` };

    // Create download directory if it doesn't exist (Actually check for write access, not existence, since fsPromises does not have a `existsSync` method)
    if (!fs.access(downloadPath)) {
      await fs.mkdir(downloadPath, { recursive: true });
    }

    const images: Record<string, any>[] = [];
    for (const result of jsonResult) {
      const jobId = result.job_id;
      for (const page of result.pages) {
        if (this.verbose) {
          console.log(`> Image for page ${page.page}: ${page.images}`);
        }
        for (const image of page.images) {
          const imageName = image.name;
          // Get the full path
          let imagePath = `${downloadPath}/${jobId}-${imageName}`;

          if (!imagePath.endsWith(".png") && !imagePath.endsWith(".jpg")) {
            imagePath += ".png";
          }

          // Get a valid image path
          image.path = imagePath;
          image.job_id = jobId;
          image.original_pdf_path = result.file_path;
          image.page_number = page.page;

          const imageUrl = `${this.baseUrl}/job/${jobId}/result/image/${imageName}`;
          const response = await fetch(imageUrl, { headers });
          if (!response.ok) {
            throw new Error(
              `Failed to download image: ${await response.text()}`,
            );
          }
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await fs.writeFile(imagePath, buffer);

          images.push(image);
        }
      }
    }
    return images;
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
