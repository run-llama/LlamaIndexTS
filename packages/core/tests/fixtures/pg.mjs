import { PGVectorStore } from "llamaindex";

const vectorStore = new PGVectorStore();
vectorStore.client();
