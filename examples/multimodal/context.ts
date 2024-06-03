// call pnpm tsx multimodal/load.ts first to init the storage
import {
  ContextChatEngine,
  NodeWithScore,
  ObjectType,
  OpenAI,
  RetrievalEndEvent,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { getStorageContext } from "./storage";

// Update chunk size and overlap
Settings.chunkSize = 512;
Settings.chunkOverlap = 20;

// Update llm
Settings.llm = new OpenAI({ model: "gpt-4-turbo", maxTokens: 512 });

// Update callbackManager
Settings.callbackManager.on("retrieve-end", (event: RetrievalEndEvent) => {
  const { nodes, query } = event.detail.payload;
  const imageNodes = nodes.filter(
    (node: NodeWithScore) => node.node.type === ObjectType.IMAGE_DOCUMENT,
  );
  const textNodes = nodes.filter(
    (node: NodeWithScore) => node.node.type === ObjectType.TEXT,
  );
  console.log(
    `Retrieved ${textNodes.length} text nodes and ${imageNodes.length} image nodes for query: ${query}`,
  );
});

async function main() {
  const storageContext = await getStorageContext();
  const index = await VectorStoreIndex.init({
    storageContext,
  });
  // topK for text is 0 and for image 1 => we only retrieve one image and no text based on the query
  const retriever = index.asRetriever({ topK: { TEXT: 0, IMAGE: 1 } });
  // NOTE: we set the contextRole to "user" (default is "system"). The reason is that GPT-4 does not support
  // images in a system message
  const chatEngine = new ContextChatEngine({ retriever, contextRole: "user" });

  // the ContextChatEngine will use the Clip embedding to retrieve the closest image
  // (the lady in the chair) and use it in the context for the query
  const response = await chatEngine.chat({
    message: "What is the name of the painting with the lady in the chair?",
  });

  console.log(response.response, "\n");
}

main().catch(console.error);
