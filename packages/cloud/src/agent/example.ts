/**
 * Example usage of the Agent Data API
 */

import { getEnv } from "@llamaindex/env";
import { createAgentDataClient } from "./index";
import type { TypedAgentData } from "./types";
import { StatusType } from "./types";

// Define your agent data schema
interface MyAgentSchema {
  prompt: string;
  temperature: number;
  maxTokens: number;
  tools?: string[];
}

async function main() {
  // Initialize the client
  const apiKey = getEnv("LLAMA_CLOUD_API_KEY");
  const baseUrl = getEnv("LLAMA_CLOUD_BASE_URL");

  const client = createAgentDataClient({
    ...(apiKey && { apiKey }),
    ...(baseUrl && { baseUrl }),
  });

  try {
    // Create a new agent data entry
    const agentData = await client.create<MyAgentSchema>({
      agentSlug: "customer-support-agent",
      collection: "production",
      data: {
        prompt: "You are a helpful customer support agent...",
        temperature: 0.7,
        maxTokens: 1000,
        tools: ["search", "calculator"],
      },
    });

    console.log("Created agent data:", agentData);

    // Get the agent data
    const retrieved = await client.get<MyAgentSchema>(agentData.id);
    if (retrieved) {
      console.log("Retrieved agent data:", retrieved);
    }

    // Update the agent data
    const updated = await client.update<MyAgentSchema>(agentData.id, {
      data: {
        prompt: "You are a helpful and friendly customer support agent...",
        temperature: 0.8,
        maxTokens: 1500,
        tools: ["search", "calculator", "email"],
      },
    });

    console.log("Updated agent data:", updated);

    // List all agent data
    const list = await client.list<MyAgentSchema>({
      agentSlug: "customer-support-agent",
      collection: "production",
      pageSize: 10,
    });

    console.log(`Found ${list.items.length} agent data entries`);
    list.items.forEach((item: TypedAgentData<MyAgentSchema>) => {
      console.log(`- ${item.id}: ${item.data.prompt.substring(0, 50)}...`);
    });

    // Extract data (if supported by the agent)
    try {
      const extracted = await client.extract(
        "customer-support-agent",
        { query: "What is the current temperature setting?" },
        {
          timeout: 30000,
          retryCount: 3,
        },
      );

      if (extracted.status === StatusType.COMPLETED) {
        console.log("Extracted data:", extracted.data);
      } else if (extracted.status === StatusType.FAILED) {
        console.error("Extraction failed:", extracted.error);
      }
    } catch (error) {
      console.log("Extraction not supported or failed:", error);
    }

    // Clean up - delete the agent data
    await client.delete(agentData.id);
    console.log("Deleted agent data");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example: To run this example, call main()
// main().catch(console.error);
