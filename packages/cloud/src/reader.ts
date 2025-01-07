import { type Client, createClient, createConfig } from "@hey-api/client-fetch";
import { Document, FileReader } from "@llamaindex/core/schema";
import { fs, getEnv, path } from "@llamaindex/env";
import {
  type Body_upload_file_api_v1_parsing_upload_post,
  type ParserLanguages,
  getJobApiV1ParsingJobJobIdGet,
  getJobImageResultApiV1ParsingJobJobIdResultImageNameGet,
  getJobJsonResultApiV1ParsingJobJobIdResultJsonGet,
  getJobResultApiV1ParsingJobJobIdResultMarkdownGet,
  getJobTextResultApiV1ParsingJobJobIdResultTextGet,
  uploadFileApiV1ParsingUploadPost,
} from "./api";
import { sleep } from "./utils";

export type Language = ParserLanguages;

export type ResultType = "text" | "markdown" | "json";

//todo: should move into @llamaindex/env
type WriteStream = {
  write: (text: string) => void;
};

// Do not modify this variable or cause type errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-var
var process: any;

/**
 * Represents a reader for parsing files using the LlamaParse API.
 * See https://github.com/run-llama/llama_parse
 */
export class LlamaParseReader extends FileReader {
  // The API key for the LlamaParse API. Can be set as an environment variable: LLAMA_CLOUD_API_KEY
  apiKey: string;
  // The base URL of the Llama Cloud Platform.
  baseUrl: string = "https://api.cloud.llamaindex.ai";
  // The result type for the parser.
  resultType: ResultType = "text";
  // The interval in seconds to check if the parsing is done.
  checkInterval = 1;
  // The maximum timeout in seconds to wait for the parsing to finish.
  maxTimeout = 2000;
  // Whether to print the progress of the parsing.
  verbose = true;
  // The language of the text to parse.
  language: ParserLanguages[] = ["en"];
  // The parsing instruction for the parser. Backend default is an empty string.
  parsingInstruction?: string | undefined;
  // Wether to ignore diagonal text (when the text rotation in degrees is not 0, 90, 180 or 270, so not a horizontal or vertical text). Backend default is false.
  skipDiagonalText?: boolean | undefined;
  // Wheter to ignore the cache and re-process the document. All documents are kept in cache for 48hours after the job was completed to avoid processing the same document twice. Backend default is false.
  invalidateCache?: boolean | undefined;
  // Wether the document should not be cached in the first place. Backend default is false.
  doNotCache?: boolean | undefined;
  // Wether to use a faster mode to extract text from documents. This mode will skip OCR of images, and table/heading reconstruction. Note: Non-compatible with gpt4oMode. Backend default is false.
  fastMode?: boolean | undefined;
  // Wether to keep column in the text according to document layout. Reduce reconstruction accuracy, and LLM's/embedings performances in most cases.
  doNotUnrollColumns?: boolean | undefined;
  // A templated page separator to use to split the text. If the results contain `{page_number}` (e.g. JSON mode), it will be replaced by the next page number. If not set the default separator '\\n---\\n' will be used.
  pageSeparator?: string | undefined;
  //A templated prefix to add to the beginning of each page. If the results contain `{page_number}`, it will be replaced by the page number.>
  pagePrefix?: string | undefined;
  // A templated suffix to add to the end of each page. If the results contain `{page_number}`, it will be replaced by the page number.
  pageSuffix?: string | undefined;
  // Deprecated. Use vendorMultimodal params. Whether to use gpt-4o to extract text from documents.
  gpt4oMode: boolean = false;
  // Deprecated. Use vendorMultimodal params. The API key for the GPT-4o API. Optional, lowers the cost of parsing. Can be set as an env variable: LLAMA_CLOUD_GPT4O_API_KEY.
  gpt4oApiKey?: string | undefined;
  // The bounding box to use to extract text from documents. Describe as a string containing the bounding box margins.
  boundingBox?: string | undefined;
  // The target pages to extract text from documents. Describe as a comma separated list of page numbers. The first page of the document is page 0
  targetPages?: string | undefined;
  // Whether or not to ignore and skip errors raised during parsing.
  ignoreErrors: boolean = true;
  // Whether to split by page using the pageSeparator or '\n---\n' as default.
  splitByPage: boolean = true;
  // Whether to use the vendor multimodal API.
  useVendorMultimodalModel: boolean = false;
  // The model name for the vendor multimodal API
  vendorMultimodalModelName?: string | undefined;
  // The API key for the multimodal API. Can also be set as an env variable: LLAMA_CLOUD_VENDOR_MULTIMODAL_API_KEY
  vendorMultimodalApiKey?: string | undefined;

  webhookUrl?: string | undefined;
  premiumMode?: boolean | undefined;
  takeScreenshot?: boolean | undefined;
  disableOcr?: boolean | undefined;
  disableReconstruction?: boolean | undefined;
  inputS3Path?: string | undefined;
  outputS3PathPrefix?: string | undefined;
  continuousMode?: boolean | undefined;
  isFormattingInstruction?: boolean | undefined;
  annotateLinks?: boolean | undefined;
  azureOpenaiDeploymentName?: string | undefined;
  azureOpenaiEndpoint?: string | undefined;
  azureOpenaiApiVersion?: string | undefined;
  azureOpenaiKey?: string | undefined;
  auto_mode?: boolean | undefined;
  auto_mode_trigger_on_image_in_page?: boolean | undefined;
  auto_mode_trigger_on_table_in_page?: boolean | undefined;
  auto_mode_trigger_on_text_in_page?: string | undefined;
  auto_mode_trigger_on_regexp_in_page?: string | undefined;
  bbox_bottom?: number | undefined;
  bbox_left?: number | undefined;
  bbox_right?: number | undefined;
  bbox_top?: number | undefined;
  disable_image_extraction?: boolean | undefined;
  extract_charts?: boolean | undefined;
  guess_xlsx_sheet_name?: boolean | undefined;
  html_make_all_elements_visible?: boolean | undefined;
  html_remove_fixed_elements?: boolean | undefined;
  html_remove_navigation_elements?: boolean | undefined;
  http_proxy?: string | undefined;
  input_url?: string | undefined;
  max_pages?: number | undefined;
  output_pdf_of_document?: boolean | undefined;
  structured_output?: boolean | undefined;
  structured_output_json_schema?: string | undefined;
  structured_output_json_schema_name?: string | undefined;
  extract_layout?: boolean | undefined;

  // numWorkers is implemented in SimpleDirectoryReader
  stdout?: WriteStream | undefined;

  readonly #client: Client;

  constructor(
    params: Partial<Omit<LlamaParseReader, "language" | "apiKey">> & {
      language?: ParserLanguages | ParserLanguages[] | undefined;
      apiKey?: string | undefined;
    } = {},
  ) {
    super();
    Object.assign(this, params);
    this.language = Array.isArray(this.language)
      ? this.language
      : [this.language];
    this.stdout =
      (params.stdout ?? typeof process !== "undefined")
        ? process!.stdout
        : undefined;
    const apiKey = params.apiKey ?? getEnv("LLAMA_CLOUD_API_KEY");
    if (!apiKey) {
      throw new Error(
        "API Key is required for LlamaParseReader. Please pass the apiKey parameter or set the LLAMA_CLOUD_API_KEY environment variable.",
      );
    }
    this.apiKey = apiKey;
    if (this.baseUrl.endsWith("/")) {
      this.baseUrl = this.baseUrl.slice(0, -"/".length);
    }
    if (this.baseUrl.endsWith("/api/parsing")) {
      this.baseUrl = this.baseUrl.slice(0, -"/api/parsing".length);
    }

    if (params.gpt4oMode) {
      params.gpt4oApiKey =
        params.gpt4oApiKey ?? getEnv("LLAMA_CLOUD_GPT4O_API_KEY");

      this.gpt4oApiKey = params.gpt4oApiKey;
    }
    if (params.useVendorMultimodalModel) {
      params.vendorMultimodalApiKey =
        params.vendorMultimodalApiKey ??
        getEnv("LLAMA_CLOUD_VENDOR_MULTIMODAL_API_KEY");

      this.vendorMultimodalApiKey = params.vendorMultimodalApiKey;
    }

    this.#client = createClient(
      createConfig({
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        baseUrl: this.baseUrl,
      }),
    );
  }

  // Create a job for the LlamaParse API
  async #createJob(data: Uint8Array, filename?: string): Promise<string> {
    if (this.verbose) {
      console.log("Started uploading the file");
    }

    // todo: remove Blob usage when we drop Node.js 18 support
    const file: File | Blob =
      globalThis.File && filename
        ? new File([data], filename)
        : new Blob([data]);

    const body = {
      file,
      language: this.language,
      parsing_instruction: this.parsingInstruction,
      skip_diagonal_text: this.skipDiagonalText,
      invalidate_cache: this.invalidateCache,
      do_not_cache: this.doNotCache,
      fast_mode: this.fastMode,
      do_not_unroll_columns: this.doNotUnrollColumns,
      page_separator: this.pageSeparator,
      page_prefix: this.pagePrefix,
      page_suffix: this.pageSuffix,
      gpt4o_mode: this.gpt4oMode,
      gpt4o_api_key: this.gpt4oApiKey,
      bounding_box: this.boundingBox,
      target_pages: this.targetPages,
      use_vendor_multimodal_model: this.useVendorMultimodalModel,
      vendor_multimodal_model_name: this.vendorMultimodalModelName,
      vendor_multimodal_api_key: this.vendorMultimodalApiKey,
      premium_mode: this.premiumMode,
      webhook_url: this.webhookUrl,
      take_screenshot: this.takeScreenshot,
      disable_ocr: this.disableOcr,
      disable_reconstruction: this.disableReconstruction,
      input_s3_path: this.inputS3Path,
      output_s3_path_prefix: this.outputS3PathPrefix,
      continuous_mode: this.continuousMode,
      is_formatting_instruction: this.isFormattingInstruction,
      annotate_links: this.annotateLinks,
      azure_openai_deployment_name: this.azureOpenaiDeploymentName,
      azure_openai_endpoint: this.azureOpenaiEndpoint,
      azure_openai_api_version: this.azureOpenaiApiVersion,
      azure_openai_key: this.azureOpenaiKey,
      auto_mode: this.auto_mode,
      auto_mode_trigger_on_image_in_page:
        this.auto_mode_trigger_on_image_in_page,
      auto_mode_trigger_on_table_in_page:
        this.auto_mode_trigger_on_table_in_page,
      auto_mode_trigger_on_text_in_page: this.auto_mode_trigger_on_text_in_page,
      auto_mode_trigger_on_regexp_in_page:
        this.auto_mode_trigger_on_regexp_in_page,
      bbox_bottom: this.bbox_bottom,
      bbox_left: this.bbox_left,
      bbox_right: this.bbox_right,
      bbox_top: this.bbox_top,
      disable_image_extraction: this.disable_image_extraction,
      extract_charts: this.extract_charts,
      guess_xlsx_sheet_name: this.guess_xlsx_sheet_name,
      html_make_all_elements_visible: this.html_make_all_elements_visible,
      html_remove_fixed_elements: this.html_remove_fixed_elements,
      html_remove_navigation_elements: this.html_remove_navigation_elements,
      http_proxy: this.http_proxy,
      input_url: this.input_url,
      max_pages: this.max_pages,
      output_pdf_of_document: this.output_pdf_of_document,
      structured_output: this.structured_output,
      structured_output_json_schema: this.structured_output_json_schema,
      structured_output_json_schema_name:
        this.structured_output_json_schema_name,
      extract_layout: this.extract_layout,
    } satisfies {
      [Key in keyof Body_upload_file_api_v1_parsing_upload_post]-?:
        | Body_upload_file_api_v1_parsing_upload_post[Key]
        | undefined;
    } as unknown as Body_upload_file_api_v1_parsing_upload_post;

    const response = await uploadFileApiV1ParsingUploadPost({
      client: this.#client,
      throwOnError: true,
      signal: AbortSignal.timeout(this.maxTimeout * 1000),
      body,
    });

    return response.data.id;
  }

  // Get the result of the job
  private async getJobResult(
    jobId: string,
    resultType: "text" | "json" | "markdown",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const signal = AbortSignal.timeout(this.maxTimeout * 1000);
    let tries = 0;
    while (true) {
      await sleep(this.checkInterval * 1000);

      // Check the job status. If unsuccessful response, checks if maximum timeout has been reached. If reached, throws an error
      const result = await getJobApiV1ParsingJobJobIdGet({
        client: this.#client,
        throwOnError: true,
        path: {
          job_id: jobId,
        },
        signal,
      });
      const { data } = result;

      const status = (data as Record<string, unknown>)["status"];
      // If job has completed, return the result
      if (status === "SUCCESS") {
        let result;
        switch (resultType) {
          case "json": {
            result = await getJobJsonResultApiV1ParsingJobJobIdResultJsonGet({
              client: this.#client,
              throwOnError: true,
              path: {
                job_id: jobId,
              },
              signal,
            });
            break;
          }
          case "markdown": {
            result = await getJobResultApiV1ParsingJobJobIdResultMarkdownGet({
              client: this.#client,
              throwOnError: true,
              path: {
                job_id: jobId,
              },
              signal,
            });
            break;
          }
          case "text": {
            result = await getJobTextResultApiV1ParsingJobJobIdResultTextGet({
              client: this.#client,
              throwOnError: true,
              path: {
                job_id: jobId,
              },
              signal,
            });
            break;
          }
        }
        return result.data;
        // If job is still pending, check if maximum timeout has been reached. If reached, throws an error
      } else if (status === "PENDING") {
        signal.throwIfAborted();
        if (this.verbose && tries % 10 === 0) {
          this.stdout?.write(".");
        }
        tries++;
      } else {
        if (this.verbose) {
          console.error(
            `Recieved Error response ${status} for job ${jobId}.  Got Error Code: ${data.error_code} and Error Message: ${data.error_message}`,
          );
        }
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
   * @param {Uint8Array} fileContent - The content of the file to be loaded.
   * @param {string} filename - The name of the file to be loaded.
   * @return {Promise<Document[]>} A Promise object that resolves to an array of Document objects.
   */
  async loadDataAsContent(
    fileContent: Uint8Array,
    filename?: string,
  ): Promise<Document[]> {
    return this.#createJob(fileContent, filename)
      .then(async (jobId) => {
        if (this.verbose) {
          console.log(`Started parsing the file under job id ${jobId}`);
        }

        // Return results as Document objects
        const jobResults = await this.getJobResult(jobId, this.resultType);
        const resultText = jobResults[this.resultType];

        // Split the text by separator if splitByPage is true
        if (this.splitByPage) {
          return this.splitTextBySeparator(resultText);
        }

        return [
          new Document({
            text: resultText,
          }),
        ];
      })
      .catch((error) => {
        if (this.ignoreErrors) {
          console.warn(
            `Error while parsing the file: ${error.message ?? error.detail}`,
          );
          return [];
        } else {
          throw error;
        }
      });
  }
  /**
   * Loads data from a file and returns an array of JSON objects.
   * To be used with resultType = "json"
   *
   * @param {string} filePathOrContent - The file path to the file or the content of the file as a Buffer
   * @return {Promise<Record<string, any>[]>} A Promise that resolves to an array of JSON objects.
   */
  async loadJson(
    filePathOrContent: string | Uint8Array,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Record<string, any>[]> {
    let jobId;
    const isFilePath = typeof filePathOrContent === "string";
    try {
      const data = isFilePath
        ? await fs.readFile(filePathOrContent)
        : filePathOrContent;
      // Creates a job for the file
      jobId = await this.#createJob(
        data,
        isFilePath ? path.basename(filePathOrContent) : undefined,
      );
      if (this.verbose) {
        console.log(`Started parsing the file under job id ${jobId}`);
      }

      // Return results as an array of JSON objects (same format as Python version of the reader)
      const resultJson = await this.getJobResult(jobId, "json");
      resultJson.job_id = jobId;
      resultJson.file_path = isFilePath ? filePathOrContent : undefined;
      return [resultJson];
    } catch (e) {
      if (this.ignoreErrors) {
        console.error(`Error while parsing the file under job id ${jobId}`, e);
        return [];
      } else {
        throw e;
      }
    }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jsonResult: Record<string, any>[],
    downloadPath: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Record<string, any>[]> {
    try {
      // Create download directory if it doesn't exist (Actually check for write access, not existence, since fsPromises does not have a `existsSync` method)
      try {
        await fs.access(downloadPath);
      } catch {
        await fs.mkdir(downloadPath, { recursive: true });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const images: Record<string, any>[] = [];
      for (const result of jsonResult) {
        const jobId = result.job_id;
        for (const page of result.pages) {
          if (this.verbose) {
            console.log(`> Image for page ${page.page}: ${page.images}`);
          }
          for (const image of page.images) {
            const imageName = image.name;
            const imagePath = await this.getImagePath(
              downloadPath,
              jobId,
              imageName,
            );
            await this.fetchAndSaveImage(imageName, imagePath, jobId);
            // Assign metadata to the image
            image.path = imagePath;
            image.job_id = jobId;
            image.original_pdf_path = result.file_path;
            image.page_number = page.page;
            images.push(image);
          }
        }
      }
      return images;
    } catch (e) {
      console.error(`Error while downloading images from the parsed result`, e);
      if (this.ignoreErrors) {
        return [];
      } else {
        throw e;
      }
    }
  }

  private async getImagePath(
    downloadPath: string,
    jobId: string,
    imageName: string,
  ): Promise<string> {
    return path.join(downloadPath, `${jobId}-${imageName}`);
  }

  private async fetchAndSaveImage(
    imageName: string,
    imagePath: string,
    jobId: string,
  ): Promise<void> {
    const response =
      await getJobImageResultApiV1ParsingJobJobIdResultImageNameGet({
        client: this.#client,
        path: {
          job_id: jobId,
          name: imageName,
        },
      });
    if (response.error) {
      throw new Error(`Failed to download image: ${response.error.detail}`);
    }
    const blob = (await response.data) as Blob;
    // Write the image buffer to the specified imagePath
    await fs.writeFile(imagePath, new Uint8Array(await blob.arrayBuffer()));
  }

  // Filters out invalid values (null, undefined, empty string) of specific params.
  private filterSpecificParams(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>,
    keysToCheck: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredParams: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (keysToCheck.includes(key)) {
        if (value !== null && value !== undefined && value !== "") {
          filteredParams[key] = value;
        }
      } else {
        filteredParams[key] = value;
      }
    }
    return filteredParams;
  }

  private splitTextBySeparator(text: string): Document[] {
    const separator = this.pageSeparator ?? "\n---\n";
    const textChunks = text.split(separator);
    return textChunks.map(
      (docChunk: string) =>
        new Document({
          text: docChunk,
        }),
    );
  }
}
