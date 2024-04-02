const { PGVectorStore } = require("llamaindex");

const vectorStore = new PGVectorStore();
vectorStore.client();
