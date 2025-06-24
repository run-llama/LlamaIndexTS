import { openai } from "@llamaindex/openai";
import { mcp } from "@llamaindex/tools";
import { agent } from "@llamaindex/workflow";

async function main() {
  // Create an MCP server for filesystem tools
  const server = mcp({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem@latest", "."],
    verbose: true,
  });
  //
  // You can also connect to a remote MCP server using:
  // 1. StreamableHTTP transport (recommended)
  // See: https://modelcontextprotocol.io/docs/concepts/transports#streamable-http
  // const server = mcp({
  //   url: "http://localhost:8000/mcp",
  //   verbose: true,
  // });
  // 2.Or using SSE transport (will be deprecated soon)
  // See: https://modelcontextprotocol.io/docs/concepts/transports#server-sent-events-sse-deprecated
  // const server = mcp({
  //   url: "http://localhost:8000/mcp",
  //   useSSETransport: true,
  //   verbose: true,
  // });

  try {
    // Create an agent that uses the MCP tools
    const myAgent = agent({
      name: "Assistant",
      systemPrompt: "Use the tools to achieve the task.",
      tools: await server.tools(),
      llm: openai({ model: "gpt-4o" }),
      verbose: true,
    });

    // Run a task
    const response = await myAgent.run("What are the available tools?");

    console.log("Agent response:", response.data);
  } finally {
    await server.cleanup();
  }
}

main().catch(console.error);
