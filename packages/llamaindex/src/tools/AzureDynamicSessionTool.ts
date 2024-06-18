import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import { getEnv } from "@llamaindex/env";
import crypto from "node:crypto";
import { createWriteStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { FormData, fetch } from "undici";
import type { BaseTool, ToolMetadata } from "../types.js";

const uuidv4 = () => crypto.randomUUID();

export type InterpreterParameter = {
  code: string;
};
export type InterpreterToolOutput = {
  result: string;
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
  data: Buffer;

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
    const __dirname = dirname(__filename);

    if (!_userAgent) {
      const data = await readFile(
        join(__dirname, "..", "package.json"),
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
  name: "azure_dynamic_sessions_python_interpreter",
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
  /**
   * The metadata for the tool.
   */
  metadata: ToolMetadata;

  /**
   * The session ID to use for the session pool. Defaults to a random UUID.
   */
  sessionId: string;

  /**
   * The endpoint of the Azure pool management service.
   * This is where the tool will send requests to interact with the session pool.
   * If not provided, the tool will use the value of the `AZURE_CONTAINER_APP_SESSION_POOL_MANAGEMENT_ENDPOINT` environment variable.
   */
  poolManagementEndpoint: string;

  /**
   * A function that returns the access token to use for the session pool.
   */
  private azureADTokenProvider: () => Promise<string>;

  constructor(params?: AzureDynamicSessionToolParams) {
    this.metadata = params?.metadata || DEFAULT_META_DATA;
    this.sessionId = params?.sessionId || uuidv4();
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
          const writer = createWriteStream(resolve(params.localFilename));
          Readable.fromWeb(response.body).pipe(writer);
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
    const apiUrl = this._buildUrl("/code/execute");
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

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      return (await response.json()) as InterpreterToolOutput;
    } catch (error) {
      return {
        result: "",
        stdout: "",
        stderr: "Error: Failed to execute Python code. " + error,
      };
    }
  }
}
