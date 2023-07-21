import { VectorStoreIndex } from "../indices/vectorStore/VectorStoreIndex";
import { OpenAIEmbedding } from "../Embedding";
import { OpenAI } from "../llm/LLM";
import { Document } from "../Node";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import {
  CallbackManager,
  RetrievalCallbackResponse,
  StreamCallbackResponse,
} from "../callbacks/CallbackManager";
import { ListIndex, ListRetrieverMode } from "../indices/list";
import {
  ResponseSynthesizer,
  SimpleResponseBuilder,
} from "../ResponseSynthesizer";
import { mockEmbeddingModel, mockLlmGeneration } from "./utility/mockOpenAI";

// Mock the OpenAI getOpenAISession function during testing
jest.mock("../llm/openai", () => {
  return {
    getOpenAISession: jest.fn().mockImplementation(() => null),
  };
});

describe("CallbackManager: onLLMStream and onRetrieve", () => {
  let serviceContext: ServiceContext;
  let streamCallbackData: StreamCallbackResponse[] = [];
  let retrieveCallbackData: RetrievalCallbackResponse[] = [];
  let document: Document;

  beforeAll(async () => {
    document = new Document({ text: "Author: My name is Paul Graham" });
    const callbackManager = new CallbackManager({
      onLLMStream: (data) => {
        streamCallbackData.push(data);
      },
      onRetrieve: (data) => {
        retrieveCallbackData.push(data);
      },
    });

    const languageModel = new OpenAI({
      model: "gpt-3.5-turbo",
      callbackManager,
    });
    mockLlmGeneration({ languageModel, callbackManager });

    const embedModel = new OpenAIEmbedding();
    mockEmbeddingModel(embedModel);

    serviceContext = serviceContextFromDefaults({
      callbackManager,
      llm: languageModel,
      embedModel,
    });
  });

  beforeEach(() => {
    streamCallbackData = [];
    retrieveCallbackData = [];
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test("For VectorStoreIndex w/ a SimpleResponseBuilder", async () => {
    const vectorStoreIndex = await VectorStoreIndex.fromDocuments(
      [document],
      undefined,
      serviceContext
    );
    const queryEngine = vectorStoreIndex.asQueryEngine();
    const query = "What is the author's name?";
    const response = await queryEngine.query(query);
    expect(response.toString()).toBe("MOCK_TOKEN_1-MOCK_TOKEN_2");
    expect(streamCallbackData).toEqual([
      {
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "llmPredict",
          tags: ["final"],
        },
        index: 0,
        token: {
          id: "id",
          object: "object",
          created: 1,
          model: "model",
          choices: expect.any(Array),
        },
      },
      {
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "llmPredict",
          tags: ["final"],
        },
        index: 1,
        token: {
          id: "id",
          object: "object",
          created: 1,
          model: "model",
          choices: expect.any(Array),
        },
      },
      {
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "llmPredict",
          tags: ["final"],
        },
        index: 2,
        isDone: true,
      },
    ]);
    expect(retrieveCallbackData).toEqual([
      {
        query: query,
        nodes: expect.any(Array),
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "retrieve",
          tags: ["final"],
        },
      },
    ]);
    // both retrieval and streaming should have
    // the same parent event
    expect(streamCallbackData[0].event.parentId).toBe(
      retrieveCallbackData[0].event.parentId
    );
  });

  test("For ListIndex w/ a ListIndexRetriever", async () => {
    const listIndex = await ListIndex.fromDocuments({
      documents: [document],
      serviceContext,
    });
    const responseBuilder = new SimpleResponseBuilder(serviceContext);
    const responseSynthesizer = new ResponseSynthesizer({
      serviceContext: serviceContext,
      responseBuilder,
    });
    const queryEngine = listIndex.asQueryEngine({
      responseSynthesizer,
    });
    const query = "What is the author's name?";
    const response = await queryEngine.query(query);
    expect(response.toString()).toBe("MOCK_TOKEN_1-MOCK_TOKEN_2");
    expect(streamCallbackData).toEqual([
      {
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "llmPredict",
          tags: ["final"],
        },
        index: 0,
        token: {
          id: "id",
          object: "object",
          created: 1,
          model: "model",
          choices: expect.any(Array),
        },
      },
      {
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "llmPredict",
          tags: ["final"],
        },
        index: 1,
        token: {
          id: "id",
          object: "object",
          created: 1,
          model: "model",
          choices: expect.any(Array),
        },
      },
      {
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "llmPredict",
          tags: ["final"],
        },
        index: 2,
        isDone: true,
      },
    ]);
    expect(retrieveCallbackData).toEqual([
      {
        query: query,
        nodes: expect.any(Array),
        event: {
          id: expect.any(String),
          parentId: expect.any(String),
          type: "retrieve",
          tags: ["final"],
        },
      },
    ]);
    // both retrieval and streaming should have
    // the same parent event
    expect(streamCallbackData[0].event.parentId).toBe(
      retrieveCallbackData[0].event.parentId
    );
  });
});
