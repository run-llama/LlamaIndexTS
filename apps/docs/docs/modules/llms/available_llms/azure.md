# Azure OpenAI

To use Azure OpenAI, you only need to set a few environment variables together with the `OpenAI` class.

For example:

## Environment Variables

```
export AZURE_OPENAI_KEY="<YOUR KEY HERE>"
export AZURE_OPENAI_ENDPOINT="<YOUR ENDPOINT, see https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython&pivots=rest-api>"
export AZURE_OPENAI_DEPLOYMENT="gpt-4" # or some other deployment name
```

## Usage

```ts
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const azureOpenaiLLM = new OpenAI({ model: "gpt-4", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: azureOpenaiLLM });
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document], {
  serviceContext,
});
```

## Query

```ts
const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```

## Full Example

```ts
import {
  Anthropic,
  Document,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

async function main() {
  // Create an instance of the LLM
  const azureOpenaiLLM = new OpenAI({ model: "gpt-4", temperature: 0 });

  // Create a service context
  const serviceContext = serviceContextFromDefaults({ llm: azureOpenaiLLM });

  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document], {
    serviceContext,
  });

  // Create a query engine
  const queryEngine = index.asQueryEngine({
    retriever,
  });

  const query = "What is the meaning of life?";

  // Query
  const response = await queryEngine.query({
    query,
  });

  // Log the response
  console.log(response.response);
}
```
