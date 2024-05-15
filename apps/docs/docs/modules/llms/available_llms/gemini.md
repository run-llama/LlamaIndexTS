# Gemini

## Usage

```ts
import { Gemini, Settings, GEMINI_MODEL } from "llamaindex";

Settings.llm = new Gemini({
  model: GEMINI_MODEL.GEMINI_PRO,
});
```

### Usage with Vertex AI

To use Gemini via Vertex AI you can use `GeminiVertexSession`.

GeminiVertexSession accepts the env variables: `GOOGLE_VERTEX_LOCATION` and `GOOGLE_VERTEX_PROJECT`

```ts
import { Gemini, GEMINI_MODEL, GeminiVertexSession } from "llamaindex";

const gemini = new Gemini({
  model: GEMINI_MODEL.GEMINI_PRO,
  session: new GeminiVertexSession({
    location: "us-central1",      // optional if provided by GOOGLE_VERTEX_LOCATION env variable
    project: "project1",          // optional if provided by GOOGLE_VERTEX_PROJECT env variable
    googleAuthOptions: {...},     // optional, but useful for production. It accepts all values from `GoogleAuthOptions`
  }),
});
```

[GoogleAuthOptions](https://github.com/googleapis/google-auth-library-nodejs/blob/main/src/auth/googleauth.ts)

To authenticate for local development:

```bash
npm install @google-cloud/vertexai
gcloud auth application-default login
```

To authenticate for production you'll have to use a [service account](https://cloud.google.com/docs/authentication/). `googleAuthOptions` has `credentials` which might be useful for you.

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
import {
  Gemini,
  Document,
  VectorStoreIndex,
  Settings,
  GEMINI_MODEL,
} from "llamaindex";

Settings.llm = new Gemini({
  model: GEMINI_MODEL.GEMINI_PRO,
});

async function main() {
  const document = new Document({ text: essay, id_: "essay" });

  // Load and index documents
  const index = await VectorStoreIndex.fromDocuments([document]);

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
