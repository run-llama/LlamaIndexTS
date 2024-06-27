import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import {
  Readable,
  createWriteStream,
  fileURLToPath,
  fs,
  getEnv,
  path,
  randomUUID,
} from "@llamaindex/env";
import type { BaseTool, ToolMetadata } from "../types.js";
export type InterpreterParameter = {
  code: string;
};

export type InterpreterToolOutputImage = {
  base64_data: string;
  format: string;
  type: "image";
};
export type InterpreterToolOutput = {
  result: InterpreterToolOutputImage | string;
  stdout: string;
  stderr: string;
};

export type AzureDynamicSessionToolParams = {
  code?: string;
  metadata?: ToolMetadata<InterpreterParameter>;
  /**
   * The endpoint of the pool management service.
   */
  poolManagementEndpoint: string;

  /**
   * The session ID. If not provided, a new session ID will be generated.
   */
  sessionId?: string;

  /**
   * A function that returns the access token to be used for authentication.
   * If not provided, a default implementation that uses the DefaultAzureCredential
   * will be used.
   *
   * @returns The access token to be used for authentication.
   */
  azureADTokenProvider?: () => Promise<string>;
};

export interface RemoteFileMetadata {
  /**
   * The filename of the file.
   */
  filename: string;

  /**
   * The size of the file in bytes.
   */
  size: number;

  /**
   * The last modified time of the file.
   */
  last_modified_time: string;

  /**
   * The identifier of the file.
   */
  $id: string;
}

type DownloadFileMetadata = {
  /**
   * The path to download the file from, relative to `/mnt/data`.
   * @example "file.txt"
   * @example "folder/file.txt"
   */
  remoteFilename: string;

  /**
   * The path to save the downloaded file to.
   * If not provided, the file is returned as a ReadableStream.
   * @example "/path/to/file.txt"
   */
  localFilename?: string;
};

type UploadFileMetadata = {
  /**
   * The data to upload
   */
  data: Blob;

  /**
   * The path to the local file to upload
   * @example "file.txt"
   * @example "folder/file.txt"
   */
  remoteFilename: string;
};

let _userAgent = "";

/**
 * A utility function to generate the user agent in the format:
 *
 * `llamaIndex-azure-dynamic-sessions (Language=TypeScript; node.js/v14.17.0; darwin/x64)`
 * @returns The user agent string.
 */
async function getuserAgentSuffix(): Promise<string> {
  try {
    //@ts-ignore
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    if (!_userAgent) {
      const data = await fs.readFile(
        path.join(__dirname, "..", "package.json"),
        "utf8",
      );
      const json = await JSON.parse(data.toString());
      _userAgent = `${json.name}/${json.version}`;
    }
  } catch (e) {
    _userAgent = `llamaIndex-azure-dynamic-sessions`;
  }
  return `${_userAgent} (Language=TypeScript; node.js/${process.version}; ${process.platform}; ${process.arch})`;
}

function getAzureADTokenProvider() {
  return getBearerTokenProvider(
    new DefaultAzureCredential(),
    "https://dynamicsessions.io/.default",
  );
}

const DEFAULT_META_DATA: ToolMetadata = {
  name: "code_interpreter",
  description:
    "A Python shell. Use this to execute python commands " +
    "when you need to perform calculations or computations. " +
    "Input should be a valid python command. " +
    "Returns the result, stdout, and stderr. ",
  parameters: {
    type: "object",
    properties: {
      code: {
        type: "string",
        description: "The Python code to execute",
      },
    },
    required: ["code"],
  },
};

/**
 * Azure Code Interpreter tool: A tool that allows you to interact with a dynamic session on Azure.
 */
export class AzureDynamicSessionTool
  implements BaseTool<AzureDynamicSessionToolParams>
{
  private readonly outputDir = path.normalize("tool-output");

  /**
   * The metadata for the tool.
   */
  metadata: ToolMetadata;

  /**
   * The session ID to use for the session pool. Defaults to a random UUID.
   */
  private sessionId: string;

  /**
   * The endpoint of the Azure pool management service.
   * This is where the tool will send requests to interact with the session pool.
   * If not provided, the tool will use the value of the `AZURE_CONTAINER_APP_SESSION_POOL_MANAGEMENT_ENDPOINT` environment variable.
   */
  private poolManagementEndpoint: string;

  /**
   * A function that returns the access token to use for the session pool.
   */
  private azureADTokenProvider: () => Promise<string>;

  constructor(params?: AzureDynamicSessionToolParams) {
    this.metadata = params?.metadata || DEFAULT_META_DATA;
    this.sessionId = params?.sessionId || randomUUID();
    this.poolManagementEndpoint =
      params?.poolManagementEndpoint ||
      (getEnv("AZURE_CONTAINER_APP_SESSION_POOL_MANAGEMENT_ENDPOINT") ?? "");
    this.azureADTokenProvider =
      params?.azureADTokenProvider ?? getAzureADTokenProvider();

    if (!this.poolManagementEndpoint) {
      throw new Error(
        "AZURE_CONTAINER_APP_SESSION_POOL_MANAGEMENT_ENDPOINT must be defined.",
      );
    }
  }

  _buildUrl(path: string) {
    let url = `${this.poolManagementEndpoint}${
      this.poolManagementEndpoint.endsWith("/") ? "" : "/"
    }${path}`;
    url += url.includes("?") ? "&" : "?";
    url += `identifier=${encodeURIComponent(this.sessionId)}`;
    url += `&api-version=2024-02-02-preview`;
    return url;
  }

  /**
   * Upload a file to the session under the path `/mnt/data`.
   * @param params.data The data to upload
   * @param params.remoteFilename The path to the local file to upload
   * @returns The remote file object. The list of metadatas for the uploaded files.
   */
  async uploadFile(params: UploadFileMetadata): Promise<RemoteFileMetadata> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this._buildUrl("files/upload");
    const headers = {
      Authorization: `Bearer ${token}`,
      "User-Agent": await getuserAgentSuffix(),
    };
    const body = new FormData();
    body.append("file", params.data, params.remoteFilename);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body,
      });
      const json: any = await response.json();
      return json.value[0].properties as RemoteFileMetadata;
    } catch (error) {
      throw new Error(
        `[AzureDynamicSessionTool.downloadFile] HTTP error! status: ${error}`,
      );
    }
  }

  /**
   * Download a file from the session back to your local environment.
   * @param params.remoteFilename The path to download the file from, relative to `/mnt/data`.
   * @param params.localFilename The path to save the downloaded file to. If not provided, the file is returned as a BufferedReader.
   * @returns The file as a ReadableStream if no localFilename is provided. Otherwise, the file is saved to the localFilename.
   */
  async downloadFile(
    params: DownloadFileMetadata,
  ): Promise<ReadableStream | void> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this._buildUrl(`files/content/${params.remoteFilename}`);
    const headers = {
      Authorization: `Bearer ${token}`,
      "User-Agent": await getuserAgentSuffix(),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (response.body) {
        // if localFilename is provided, save the file to the localFilename
        if (params.localFilename) {
          const writer = createWriteStream(path.resolve(params.localFilename));
          const blob = await response.blob();
          Readable.from(blob.stream()).pipe(writer);
          return;
        }

        // if localFilename is not provided, return the file as a ReadableStream
        return response.body as ReadableStream;
      } else {
        throw new Error(
          `[AzureDynamicSessionTool.downloadFile] HTTP error! status: ${response.status}`,
        );
      }
    } catch (error) {
      throw new Error(
        `[AzureDynamicSessionTool.downloadFile] HTTP error! status: ${error}`,
      );
    }
  }

  /**
   * List the files in the session.
   * @returns The metadata for the files in the session
   */
  async listFiles(): Promise<RemoteFileMetadata[]> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this._buildUrl("files");
    const headers = {
      Authorization: `Bearer ${token}`,
      "User-Agent": await getuserAgentSuffix(),
    };

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });
      const json: any = await response.json();
      const list = json.value.map(
        (x: { properties: RemoteFileMetadata }) => x.properties,
      );
      return list as RemoteFileMetadata[];
    } catch (error: unknown) {
      throw new Error(
        `[AzureDynamicSessionTool.listFiles] HTTP error! status: ${error}`,
      );
    }
  }

  /**
   * This tool is used to execute python commands when you need to perform calculations or computations in a Session. Input should be a valid python command. The tool returns the result, stdout, and stderr.
   * @param code Python code to be executed generated by llm.
   * @returns The result, stdout, and stderr.
   */
  async call({
    code,
  }: Pick<
    AzureDynamicSessionToolParams,
    "code"
  >): Promise<InterpreterToolOutput> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this._buildUrl("python/execute");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": await getuserAgentSuffix(),
    };
    const payload = {
      properties: {
        identifier: this.sessionId,
        codeInputType: "inline",
        executionType: "synchronous",
        pythonCode: code,
      },
    };

    console.log("payload", { payload });

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const output = (await response.json()) as InterpreterToolOutput;
      console.log({ output });

      if (typeof output.result !== "string") {
        const result = output.result as InterpreterToolOutputImage;

        console.log("result", { result });

        if (result.type === "image") {
          const { outputPath, filename } = await this.saveToDisk(
            (output.result as InterpreterToolOutputImage).base64_data,
            result.format,
          );
          output.result = `${outputPath}/${filename}`;
        }
      }

      return output;
    } catch (error) {
      return {
        result: "",
        stdout: "",
        stderr: "Error: Failed to execute Python code. " + error,
      };
    }
  }

  /**
   * Saves a base64 encoded file to the disk.
   * @param base64Data The base64 encoded data to save.
   * @param ext The file extension.
   * @returns The path and filename to the saved file.
   */
  private async saveToDisk(
    base64Data: string,
    ext: string,
  ): Promise<{
    outputPath: string;
    filename: string;
  }> {
    try {
      const filename = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(base64Data, "base64");
      const outputPath = await this.getOutputPath(filename);
      await fs.writeFile(outputPath, buffer);
      console.log(
        `[AzureDynamicSessionTool.saveToDisk] Saved file to ${outputPath}`,
      );
      return {
        outputPath,
        filename,
      };
    } catch (error) {
      console.error(
        `[AzureDynamicSessionTool.saveToDisk] Error saving file to disk: ${error}`,
      );
      return {
        outputPath: "",
        filename: "",
      };
    }
  }

  /**
   * Get the output path for the file.
   * @param filename The filename to save the file as.
   * @returns The output path for the file.
   */
  private async getOutputPath(filename: string) {
    if ((await this.exists(this.outputDir)) === false) {
      try {
        await fs.mkdir(this.outputDir, { recursive: true });
        console.log(
          "[AzureDynamicSessionTool.getOutputPath] Created output directory:",
          this.outputDir,
        );
      } catch (e) {
        throw new Error(
          `[AzureDynamicSessionTool.getOutputPath] Failed to create output directory: ${this.outputDir}`,
        );
      }
    }
    return path.join(this.outputDir, filename);
  }

  /**
   * Check if a file exists.
   * @param file The file to check.
   * @returns True if the file exists, false otherwise.
   */
  private async exists(file: string) {
    try {
      await fs.lstat(file);
      console.log(`[AzureDynamicSessionTool.exists] File exists: ${file}`);
      return true;
    } catch {
      console.log(
        `[AzureDynamicSessionTool.exists] File does not exist: ${file}`,
      );
      return false;
    }
  }
}
