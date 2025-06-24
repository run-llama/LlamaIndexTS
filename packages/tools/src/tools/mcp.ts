import type { JSONValue } from "@llamaindex/core/global";
import type { BaseToolWithCall } from "@llamaindex/core/llms";
import { FunctionTool } from "@llamaindex/core/tools";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  SSEClientTransport,
  type SSEClientTransportOptions,
} from "@modelcontextprotocol/sdk/client/sse.js";
import {
  StdioClientTransport,
  type StdioServerParameters,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  StreamableHTTPClientTransport,
  type StreamableHTTPClientTransportOptions,
} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { JSONSchemaType } from "ajv";

interface ToolInput {
  [key: string]: unknown;
}

type MCPCommonOptions = {
  /**
   * The prefix to add to the tool name
   */
  toolNamePrefix?: string;
  /**
   * The name of the client
   */
  clientName?: string;
  /**
   * The version of the client
   */
  clientVersion?: string;
  /**
   * Whether to log verbose output
   */
  verbose?: boolean;
};

type URLMCPOptions = MCPCommonOptions & {
  url: string;
  /**
   * Default is false which means StreamableHTTP transport will be used.
   * Set to true to use SSE transport instead.
   * @default false
   * @deprecated SSE transport will be soon deprecated. Please use StreamableHTTP transport instead.
   */
  useSSETransport?: boolean;
};

type StdioMCPClientOptions = StdioServerParameters & MCPCommonOptions;
/**
 * @deprecated SSE transport will be soon deprecated. Please use StreamableHTTPMCPClientOptions instead.
 */
type SSEMCPClientOptions = SSEClientTransportOptions & URLMCPOptions;
type StreamableHTTPMCPClientOptions = StreamableHTTPClientTransportOptions &
  URLMCPOptions;

type MCPClientOptions =
  | StdioMCPClientOptions
  | SSEMCPClientOptions
  | StreamableHTTPMCPClientOptions;

class MCPClient {
  private mcp: Client;
  private transport:
    | StreamableHTTPClientTransport
    | SSEClientTransport
    | StdioClientTransport
    | null = null;
  private verbose: boolean;
  private toolNamePrefix?: string | undefined;
  private connected: boolean = false;

  constructor(options: MCPClientOptions) {
    this.mcp = new Client({
      name: options.clientName ?? "mcp-client-cli",
      version: options.clientVersion ?? "1.0.0",
    });

    this.verbose = options.verbose ?? false;
    this.toolNamePrefix = options.toolNamePrefix;
    if ("url" in options) {
      const useSSETransport = options.useSSETransport ?? false;
      if (useSSETransport) {
        // Show deprecation warning
        console.warn(
          "SSE transport will be soon deprecated. " +
            "Please use StreamableHTTPClientTransport instead",
        );
        this.transport = new SSEClientTransport(
          new URL(options.url),
          options as SSEClientTransportOptions,
        );
      } else {
        this.transport = new StreamableHTTPClientTransport(
          new URL(options.url),
          options as StreamableHTTPClientTransportOptions,
        );
      }
    } else {
      this.transport = new StdioClientTransport(
        options as StdioServerParameters,
      );
    }
    this.connected = false;
  }

  async connectToSever() {
    if (this.verbose) {
      console.log("Connecting to MCP server...");
    }
    if (!this.transport) {
      throw new Error("Initialized with invalid options");
    }
    // @ts-expect-error - to mitigate exactOptionalPropertyTypes error
    // that we have sessionId: string | undefined from the transport
    await this.mcp.connect(this.transport);
    this.connected = true;
  }

  private async listTools(): Promise<Tool[]> {
    if (!this.connected) {
      await this.connectToSever();
    }
    const tools = await this.mcp.listTools();
    return tools.tools;
  }

  async cleanup() {
    await this.mcp.close();
    this.transport?.close();
  }

  /**
   * Get the tools from the MCP server and map to LlamaIndex tools
   */
  async tools(): Promise<BaseToolWithCall[]> {
    const mcpTools = await this.listTools();
    return mcpTools.map((tool) => {
      const parameters =
        tool.inputSchema as unknown as JSONSchemaType<ToolInput>;
      const functionTool = FunctionTool.from(
        async (input: unknown) => {
          if (this.verbose) {
            console.log("Calling tool:", tool.name, "with input:", input);
          }
          const result = await this.mcp.callTool({
            name: tool.name,
            arguments: input as unknown as Record<string, unknown>,
          });
          if (this.verbose) {
            console.log("Tool result:", result);
          }
          return result as JSONValue;
        },
        {
          name: this.toolNamePrefix
            ? `${this.toolNamePrefix}_${tool.name}`
            : tool.name,
          description: tool.description ?? "",
          parameters,
        },
      );

      return functionTool;
    });
  }
}

/**
 * Create a MCP client
 * @param options - The options for the MCP client
 * @returns A MCP client
 */
export function mcp(options: MCPClientOptions) {
  return new MCPClient(options);
}
