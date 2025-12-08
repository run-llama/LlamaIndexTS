import { OVHcloudEmbedding, OVHcloudLLM } from "@llamaindex/ovhcloud";

// OVHcloud AI Endpoints can be used for free with rate limits without an API key
// To use with an API key, set OVHCLOUD_API_KEY environment variable
// or pass it directly in the constructor
// To generate an API key, go to https://ovh.com/manager > Public Cloud > AI & Machine Learning > AI Endpoints > API keys
// Visit our catalog for the list of all available models: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/

// Example 1: Using without API key (free tier with rate limits)
const ovhcloudFree = new OVHcloudLLM({
  model: "gpt-oss-120b",
  // apiKey is optional - can be omitted or set to empty string for free tier
});

// Example 2: Using with API key
const ovhcloud = new OVHcloudLLM({
  model: "gpt-oss-120b",
  apiKey: process.env.OVHCLOUD_API_KEY || "",
});

(async () => {
  console.log("Chatting with OVHcloud AI Endpoints...");
  const generator = await ovhcloud.chat({
    messages: [
      {
        role: "system",
        content: "You are a helpful AI assistant.",
      },
      {
        role: "user",
        content: "Tell me about OVHcloud AI Endpoints",
      },
    ],
    stream: true,
  });

  for await (const message of generator) {
    process.stdout.write(message.delta);
  }
  console.log("\n");

  // Example with embeddings
  console.log("Getting embeddings...");
  const embedding = new OVHcloudEmbedding({
    model: "BGE-M3",
  });
  const vector = await embedding.getTextEmbedding("Hello world!");
  console.log("Vector dimensions:", vector.length);
  console.log("First 5 values:", vector.slice(0, 5));
})();
