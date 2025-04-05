import { openai } from "@llamaindex/openai";
import { mcp } from "@llamaindex/tools";
import { agent } from "llamaindex";

async function main() {
  // Create an MCP server for filesystem tools
  const server = mcp({
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
    verbose: true,
  });

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
    const response = await myAgent.run(
      "what are the files in the current directory?",
    );

    console.log("Agent response:", response.data);
  } finally {
    await server.cleanup();
  }
}

main().catch(console.error);
