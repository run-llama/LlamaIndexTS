/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import {
  KnownAnalyzerNames,
  KnownVectorSearchAlgorithmKind,
} from "@azure/search-documents";
import {
  AzureAISearchVectorStore,
  type FilterableMetadataFieldKeysType,
  IndexManagement,
  MetadataIndexFieldType,
} from "@llamaindex/azure";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import dotenv from "dotenv";
import {
  DocStoreStrategy,
  Document,
  FilterCondition,
  FilterOperator,
  type Metadata,
  type NodeWithScore,
  Settings,
  storageContextFromDefaults,
  TextNode,
  VectorStoreIndex,
  VectorStoreQueryMode,
} from "llamaindex";

dotenv.config();

function processResults(response: NodeWithScore[], mode: VectorStoreQueryMode) {
  response.forEach((nodeWithScore: NodeWithScore) => {
    const node = nodeWithScore.node as TextNode;
    const score = nodeWithScore.score;
    const chunkId = node.id_;

    // Retrieve metadata fields
    const fileName = node.metadata?.file_name || "Unknown";
    const filePath = node.metadata?.file_path || "Unknown";
    const textContent = node.text || "No content available";

    // Output the results
    console.log("=".repeat(40) + " Start of Result " + "=".repeat(40) + "\n");
    console.log(`Search Mode: ${mode}`);
    console.log(`Score: ${score}`);
    console.log(`File Name: ${fileName}`);
    console.log(`File Path: ${filePath}`);
    console.log(`Id: ${chunkId}`);
    console.log("\nDocument:");
    console.log(JSON.stringify(node, null, 2));
    console.log("\nExtracted Content:");
    console.log(textContent);
  });
}

// Based on https://docs.llamaindex.ai/en/stable/examples/vector_stores/AzureAISearchIndexDemo/
(async () => {
  // ---------------------------------------------------------
  // 1- Setup Azure OpenAI
  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(
    credential,
    "https://cognitiveservices.azure.com/.default",
  );
  // You need to deploy your own embedding model as well as your own chat completion model
  const azure = {
    azureADTokenProvider,
    deployment: process.env.AZURE_DEPLOYMENT_NAME,
  };
  Settings.llm = new OpenAI({ azure });
  Settings.embedModel = new OpenAIEmbedding({
    model: process.env.EMBEDDING_MODEL,
    azure: {
      ...azure,
      deployment: process.env.EMBEDDING_MODEL,
    },
  });

  // ---------------------------------------------------------
  // 2- Setup Azure AI Search
  // Define env variables in .env file
  // AZURE_AI_SEARCH_ENDPOINT=
  // AZURE_AI_SEARCH_KEY=
  // AZURE_OPENAI_ENDPOINT=
  // EMBEDDING_MODEL=text-embedding-ada-002
  // AZURE_DEPLOYMENT_NAME=gpt-4
  // AZURE_API_VERSION=2024-09-01-preview

  // Define index name
  const indexName = "llamaindex-vector-store-example";

  // ---------------------------------------------------------
  // 3a- Create Index (if it does not exist)
  // id:	      Edm.String
  // chunk:	    Edm.String
  // embedding:	Collection(Edm.Single)
  // metadata:	Edm.String
  // doc_id:	  Edm.String
  // author:	  Edm.String
  // theme:	    Edm.String
  // director:	Edm.String

  // Define metadata fields with their respective configurations
  const metadataFields = {
    author: "author",
    theme: ["theme", MetadataIndexFieldType.STRING],
    director: "director",
  };

  // Define index parameters and vector store configuration
  // Index validation:
  // - IndexManagement.VALIDATE_INDEX: will validate before creating emnbedding index and will throw a runtime error if the index does not exist
  // - IndexManagement.NO_VALIDATION: will try to access the index and will throw a runtime error if the index does not exist
  // - IndexManagement.CREATE_IF_NOT_EXISTS: will create the index if it does not exist

  const vectorStore = new AzureAISearchVectorStore({
    // If you want to use the key instead of the credential
    // uncomment the following line and comment the credential line
    // key: process.env.AZURE_AI_SEARCH_KEY,

    // If you want to use the credential instead of the key
    // make sure RBAC is enabled for this resource, in Azure
    // Learn more: https://learn.microsoft.com/azure/role-based-access-control/overview
    credential: new DefaultAzureCredential(),

    filterableMetadataFieldKeys:
      metadataFields as unknown as FilterableMetadataFieldKeysType,
    indexName,
    indexManagement: IndexManagement.CREATE_IF_NOT_EXISTS,
    idFieldKey: "id",
    chunkFieldKey: "chunk",
    embeddingFieldKey: "embedding",
    metadataStringFieldKey: "metadata",
    docIdFieldKey: "doc_id",
    embeddingDimensionality: 3072,
    // hiddenFieldKeys: ["embedding"],
    languageAnalyzer: KnownAnalyzerNames.EnLucene,
    // store vectors on disk
    vectorAlgorithmType: KnownVectorSearchAlgorithmKind.ExhaustiveKnn,

    // Optional: Set to "scalar" or "binary" if using HNSW
    // compressionType: KnownVectorSearchCompressionKind.BinaryQuantization,
  });

  {
    const ids = await vectorStore.add([
      new Document({
        text: "foooooo.",
        embedding: Array.from({ length: 1536 }, () => Math.random()),
      }),
    ]);
    console.log({ ids });
    let nodes = await vectorStore.getNodes(ids);
    console.log({ nodes });
    await vectorStore.delete(ids[0]!);
    nodes = await vectorStore.getNodes(ids);
    console.log({ nodes });
  }

  // ---------------------------------------------------------
  // 3b- Loading documents
  // Load the documents stored in the data/paul_graham/ using the SimpleDirectoryReader
  // Load documents using a directory reader
  const documents = await new SimpleDirectoryReader().loadData(
    "data/paul_graham/",
  );
  const storageContext = await storageContextFromDefaults({ vectorStore });

  // // Create index from documents with the specified storage context
  const index = await VectorStoreIndex.fromDocuments(documents, {
    storageContext,
    docStoreStrategy: DocStoreStrategy.UPSERTS,
  });

  {
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query({
      query: "What did the author do growing up?",
      similarityTopK: 3,
    } as any);
    console.log({ response });
    // The author focused on writing and programming outside of school,
    // writing short stories and experimenting with programming on an IBM 1401 in 9th grade.
    // Later, the author continued programming on microcomputers and eventually
    // convinced their father to buy a TRS-80, where they started writing simple
    // games and a word processor.
  }

  // ---------------------------------------------------------
  // 4- Insert documents into the index
  {
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query({
      query: "What colour is the sky?",
    });
    console.log({ response });
  }
  // The color of the sky varies depending on factors such as the time of day, weather conditions, and location.
  // The text does not provide information about the color of the sky.

  {
    await index.insert(
      new Document({
        text: "The sky is indigo today.",
      }),
    );

    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.query({
      query: "What colour is the sky?",
    });
    console.log({ response });
    // The color of the sky is indigo.
  }

  // ---------------------------------------------------------
  // 5- Filtering
  // FIXME: Filtering is not working. The following block will throw an error:
  // RestError: Invalid expression: Could not find a property named 'theme' on type 'search.document'.
  try {
    const documents = [
      new Document({
        text: "The Shawshank Redemption",
        metadata: {
          author: "Stephen King",
          theme: "Friendship",
        } as Metadata,
      }),
      new Document({
        text: "The Godfather",
        metadata: {
          director: "Francis Ford Coppola",
          theme: "Mafia",
        } as Metadata,
      }),
      new Document({
        text: "Inception",
        metadata: {
          director: "Christopher Nolan",
        } as Metadata,
      }),
    ];

    {
      await index.insertNodes(documents);

      const retriever = index.asRetriever({
        filters: {
          condition: FilterCondition.OR, // required
          filters: [
            {
              key: "theme",
              value: "Mafia",
              operator: FilterOperator.EQ,
            },
          ],
        },
      });
      const response = await retriever.retrieve({
        query: "What is inception about?",
      });
      processResults(response, VectorStoreQueryMode.DEFAULT);
    } // Stephen King
  } catch (error) {
    console.error(error);
  }
  return;
  // // ---------------------------------------------------------
  // 6- Query Mode

  // 6a- Perform a Vector Search (default mode)
  {
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.retrieve({
      query: "What is the meaning of life?",
      mode: VectorStoreQueryMode.DEFAULT,
    } as any);
    processResults(response, VectorStoreQueryMode.DEFAULT);
  }

  // 6b- Perform a Hybrid Search
  {
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.retrieve({
      query: "What is the meaning of life?",
      mode: VectorStoreQueryMode.HYBRID,
    } as any);
    processResults(response, VectorStoreQueryMode.HYBRID);
  }

  // 6c- Perform a Hybrid Search with Semantic Reranking
  {
    const queryEngine = index.asQueryEngine();
    const response = await queryEngine.retrieve({
      query: "What is inception about?",
      mode: VectorStoreQueryMode.SEMANTIC_HYBRID,
    } as any);
    processResults(response, VectorStoreQueryMode.SEMANTIC_HYBRID);
  }
})();
