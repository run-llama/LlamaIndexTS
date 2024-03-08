import fs from "fs/promises";
import path from "path";
import {
  FileSourceConfig,
  TemplateDataSource,
  TemplateFramework,
  TemplateVectorDB,
  WebSourceConfig,
} from "./types";

const renderEnvVar = (
  name: string,
  description?: string,
  value?: string,
): string => {
  let content = "";
  // Add the description if it exists.
  if (description) {
    content += `# ${description.replaceAll("\n", "\n# ")}\n`;
  }
  // Set the value if it exists, otherwise comment it out.
  content += value && value != "" ? `${name}=${value}\n\n` : `# ${name}=\n\n`;
  return content;
};

export const createEnvLocalFile = async (
  root: string,
  opts?: {
    openAiKey?: string;
    llamaCloudKey?: string;
    vectorDb?: TemplateVectorDB;
    model?: string;
    embeddingModel?: string;
    framework?: TemplateFramework;
    dataSource?: TemplateDataSource;
  },
) => {
  const envFileName = ".env";
  let content = "";

  const model = opts?.model || "gpt-3.5-turbo";
  content += `MODEL=${model}\n`;
  if (opts?.framework === "nextjs") {
    content += `NEXT_PUBLIC_MODEL=${model}\n`;
  }
  console.log("\nUsing OpenAI model: ", model, "\n");

  if (opts?.openAiKey) {
    content += `OPENAI_API_KEY=${opts?.openAiKey}\n`;
  }

  if (opts?.framework === "fastapi") {
    //  Default environment variables for FastAPI
    const defaultEnvs = [
      {
        name: "APP_HOST",
        description: "The address to start the backend app.",
        value: "0.0.0.0",
      },
      {
        name: "APP_PORT",
        description: "The port to start the backend app.",
        value: "8000",
      },
      {
        name: "EMBEDDING_MODEL",
        description: "Name of the embedding model to use.",
        value: opts?.embeddingModel,
      },
      {
        name: "EMBEDDING_DIM",
        description: "Dimension of the embedding model to use.",
      },
      {
        name: "LLM_TEMPERATURE",
        description: "Temperature for sampling from the model.",
      },
      {
        name: "LLM_MAX_TOKENS",
        description: "Maximum number of tokens to generate.",
      },
      {
        name: "SYSTEM_PROMPT",
        description: `Custom system prompt.
Example:
SYSTEM_PROMPT="
We have provided context information below.
---------------------
{context_str}
---------------------
Given this information, please answer the question: {query_str}
"`,
      },
    ];

    // Add the default environment variables for FastAPI
    defaultEnvs.forEach((env) => {
      content += renderEnvVar(env.name, env.description, env.value);
    });

    if ((opts?.dataSource?.config as FileSourceConfig).useLlamaParse) {
      content += renderEnvVar(
        "LLAMA_CLOUD_API_KEY",
        `Please obtain the Llama Cloud API key from https://cloud.llamaindex.ai/api-key 
and set it to the LLAMA_CLOUD_API_KEY variable below. `,
        opts?.llamaCloudKey,
      );
    }
  }

  switch (opts?.vectorDb) {
    case "mongo": {
      content += `# For generating a connection URI, see https://www.mongodb.com/docs/guides/atlas/connection-string\n`;
      content += `MONGO_URI=\n`;
      content += `MONGODB_DATABASE=\n`;
      content += `MONGODB_VECTORS=\n`;
      content += `MONGODB_VECTOR_INDEX=\n`;
      break;
    }
    case "pg": {
      content += `# For generating a connection URI, see https://docs.timescale.com/use-timescale/latest/services/create-a-service\n`;
      content += `PG_CONNECTION_STRING=\n`;
      break;
    }
    case "pinecone": {
      content += `PINECONE_API_KEY=\n`;
      content += `PINECONE_ENVIRONMENT=\n`;
      content += `PINECONE_INDEX_NAME=\n`;
      break;
    }
  }

  switch (opts?.dataSource?.type) {
    case "web": {
      const webConfig = opts?.dataSource.config as WebSourceConfig;
      content += `# web loader config\n`;
      content += `BASE_URL=${webConfig.baseUrl}\n`;
      content += `URL_PREFIX=${webConfig.baseUrl}\n`;
      content += `MAX_DEPTH=${webConfig.depth}\n`;
      break;
    }
  }

  if (content) {
    await fs.writeFile(path.join(root, envFileName), content);
    console.log(`Created '${envFileName}' file. Please check the settings.`);
  }
};
