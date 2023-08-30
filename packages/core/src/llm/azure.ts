export interface AzureOpenAIConfig {
  apiKey?: string;
  endpoint?: string;
  apiVersion?: string;
  deploymentName?: string;
}

// NOTE we're not supporting the legacy models as they're not available for new deployments
// https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/legacy-models
// If you have a need for them, please open an issue on GitHub

const ALL_AZURE_OPENAI_CHAT_MODELS = {
  "gpt-35-turbo": { contextWindow: 4096, openAIModel: "gpt-3.5-turbo" },
  "gpt-35-turbo-16k": {
    contextWindow: 16384,
    openAIModel: "gpt-3.5-turbo-16k",
  },
  "gpt-4": { contextWindow: 8192, openAIModel: "gpt-4" },
  "gpt-4-32k": { contextWindow: 32768, openAIModel: "gpt-4-32k" },
};

const ALL_AZURE_OPENAI_EMBEDDING_MODELS = {
  "text-embedding-ada-002": {
    dimensions: 1536,
    openAIModel: "text-embedding-ada-002",
    maxTokens: 8191,
  },
};

const ALL_AZURE_API_VERSIONS = [
  "2022-12-01",
  "2023-05-15",
  "2023-06-01-preview",
  "2023-07-01-preview",
];

const DEFAULT_API_VERSION = "2023-05-15";
//^ NOTE: this will change over time, if you want to pin it, use a specific version

export function getAzureConfigFromEnv(
  init?: Partial<AzureOpenAIConfig> & { model?: string },
): AzureOpenAIConfig {
  return {
    apiKey:
      init?.apiKey ??
      process.env.AZURE_OPENAI_KEY ?? // From Azure docs
      process.env.OPENAI_API_KEY ?? // Python compatible
      process.env.AZURE_OPENAI_API_KEY, // LCJS compatible
    endpoint:
      init?.endpoint ??
      process.env.AZURE_OPENAI_ENDPOINT ?? // From Azure docs
      process.env.OPENAI_API_BASE ?? // Python compatible
      process.env.AZURE_OPENAI_API_INSTANCE_NAME, // LCJS compatible
    apiVersion:
      init?.apiVersion ??
      process.env.AZURE_OPENAI_API_VERSION ?? // From Azure docs
      process.env.OPENAI_API_VERSION ?? // Python compatible
      process.env.AZURE_OPENAI_API_VERSION ?? // LCJS compatible
      DEFAULT_API_VERSION,
    deploymentName:
      init?.deploymentName ??
      process.env.AZURE_OPENAI_DEPLOYMENT ?? // From Azure docs
      process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME ?? // LCJS compatible
      init?.model, // Fall back to model name, Python compatible
  };
}

export function getAzureBaseUrl(config: AzureOpenAIConfig): string {
  return `${config.endpoint}/openai/deployments/${config.deploymentName}`;
}

export function getAzureModel(openAIModel: string) {
  for (const [key, value] of Object.entries(
    ALL_AZURE_OPENAI_EMBEDDING_MODELS,
  )) {
    if (value.openAIModel === openAIModel) {
      return key;
    }
  }

  for (const [key, value] of Object.entries(ALL_AZURE_OPENAI_CHAT_MODELS)) {
    if (value.openAIModel === openAIModel) {
      return key;
    }
  }

  throw new Error(`Unknown model: ${openAIModel}`);
}

export function shouldUseAzure() {
  return (
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_OPENAI_API_INSTANCE_NAME ||
    process.env.OPENAI_API_TYPE === "azure"
  );
}
