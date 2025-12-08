import { Helicone } from "@llamaindex/helicone";

// Optional: set envs here for quick local testing
// setEnvs({ HELICONE_API_KEY: "...", HELICONE_API_BASE: "https://ai-gateway.helicone.ai/v1" });

async function main() {
  const llm = new Helicone({
    // model is OpenAI-compatible and routed by Helicone
    model: "qwen3-coder-30b-a3b-instruct",
    // You can also pass apiKey/base via envs HELICONE_API_KEY/HELICONE_API_BASE
    // apiKey: "<helicone-api-key>",

    // Global headers for observability/metadata on every request
    additionalSessionOptions: {
      defaultHeaders: {
        // Common Helicone headers
        "Helicone-Property-User": "example-user",
        "Helicone-Property-Workspace": "example-workspace",
        // Any custom header
        "X-Custom": "demo",
      },
    },
  });

  const res = await llm.chat({
    messages: [{ role: "user", content: "Hello from Helicone!" }],
  });

  console.log("Helicone response:", res.message.content);
}

void main().catch(console.error);
