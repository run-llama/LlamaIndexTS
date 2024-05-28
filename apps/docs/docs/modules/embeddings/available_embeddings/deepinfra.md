# DeepInfra

To use DeepInfra embeddings, you need to import `DeepInfraEmbedding` from llamaindex.
Check out available embedding models [here](https://deepinfra.com/models/embeddings).

```ts
import {
  DeepInfraEmbedding,
  Settings,
  Document,
  VectorStoreIndex,
} from "llamaindex";

// Update Embed Model
Settings.embedModel = new DeepInfraEmbedding();

const document = new Document({ text: essay, id_: "essay" });

const index = await VectorStoreIndex.fromDocuments([document]);

const queryEngine = index.asQueryEngine();

const query = "What is the meaning of life?";

const results = await queryEngine.query({
  query,
});
```

By default, DeepInfraEmbedding is using the sentence-transformers/clip-ViT-B-32 model. You can change the model by passing the model parameter to the constructor.
For example:

```ts
import { DeepInfraEmbedding } from "llamaindex";

const model = "intfloat/e5-large-v2";
Settings.embedModel = new DeepInfraEmbedding({
  model,
});
```

You can also set the `maxRetries` and `timeout` parameters when initializing `DeepInfraEmbedding` for better control over the request behavior.

For example:

```ts
import { DeepInfraEmbedding, Settings } from "llamaindex";

const model = "intfloat/e5-large-v2";
const maxRetries = 5;
const timeout = 5000; // 5 seconds

Settings.embedModel = new DeepInfraEmbedding({
  model,
  maxRetries,
  timeout,
});
```

Standalone usage:

```ts
import { DeepInfraEmbedding } from "llamaindex";
import { config } from "dotenv";
// For standalone usage, you need to configure DEEPINFRA_API_TOKEN in .env file
config();

const main = async () => {
  const model = "intfloat/e5-large-v2";
  const embeddings = new DeepInfraEmbedding({ model });
  const text = "What is the meaning of life?";
  const response = await embeddings.embed([text]);
  console.log(response);
};

main();
```

For questions or feedback, please contact us at [feedback@deepinfra.com](mailto:feedback@deepinfra.com)
