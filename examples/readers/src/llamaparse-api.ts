import { LlamaParseReader } from "llamaindex";

async function main() {
  const reader = new LlamaParseReader();
  const name = `A fresh key`;
  // Generate an API key
  const genResponse = await reader.generateApiKey(name);
  // Extract UUID from response
  const api_key_id = genResponse.id;

  const updatedName = `An updated key`;
  // Update API key name
  const upResponse = await reader.updateApiKey(api_key_id, updatedName);
  console.log(upResponse);
  // Delete API key
  const delResponse = await reader.deleteApiKey(api_key_id);
  console.log(delResponse);
  // List all API keys under the account
  const listResponse = await reader.getApiKeys();
  console.log(listResponse);
  // Get parsing usage
  const usage = await reader.getParsingUsage();
  console.log(usage);
}

main().catch(console.error);
