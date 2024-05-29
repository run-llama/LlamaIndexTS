# DeepInfra

Check out available LLMs [here](https://deepinfra.com/models/text-generation).

```ts
import { DeepInfra, Settings } from "llamaindex";

// Get the API key from `DEEPINFRA_API_TOKEN` environment variable
import { config } from "dotenv";
config();
Settings.llm = new DeepInfraLLM();

// Set the API key
apiKey = "YOUR_API_KEY";
Settings.llm = new DeepInfra({ apiKey });
```

You can setup the apiKey on the environment variables, like:

```bash
export DEEPINFRA_API_TOKEN="<YOUR_API_KEY>"
```

## Load and index documents

For this example, we will use a single document. In a real-world scenario, you would have multiple documents to index.

```ts
const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);
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
import { DeepInfra, Document, VectorStoreIndex, Settings } from "llamaindex";

// Use custom LLM
const model = "meta-llama/Meta-Llama-3-8B-Instruct";
Settings.llm = new DeepInfra({ model, temperature: 0 });

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document]);

  // get retriever
  const retriever = index.asRetriever();

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

## Feedback

If you have any feedback, please reach out to us at [feedback@deepinfra.com](mailto:feedback@deepinfra.com)
