import { QdrantVectorStore } from "@llamaindex/qdrant";
import * as dotenv from "dotenv";
import {
  Document,
  MetadataMode,
  NodeWithScore,
  Settings,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

// Update callback manager
Settings.callbackManager.on("retrieve-end", (event) => {
  const { nodes } = event.detail;
  console.log(
    "The retrieved nodes are:",
    nodes.map((node: NodeWithScore) => node.node.getContent(MetadataMode.NONE)),
  );
});

dotenv.config();

const collectionName = "dog_colors";
const qdrantUrl = "http://127.0.0.1:6333";

async function main() {
  try {
    const vectorStore = new QdrantVectorStore({
      url: qdrantUrl,
      collectionName,
    });
    const ctx = await storageContextFromDefaults({ vectorStore });

    const docs = [
      new Document({
        text: "The dog is brown",
      }),
    ];

    const index = await VectorStoreIndex.fromDocuments(docs, {
      storageContext: ctx,
    });

    const queryEngine = index.asQueryEngine({
      customParams: {
        hnsw_ef: 10,
        exact: true,
        indexed_only: true,
      },
    });
    const response = await queryEngine.query({
      query: "What is the color of the dog?",
    });
    console.log(response.toString());
  } catch (error) {
    console.error(error);
  }
}

void main();
