import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { Document } from "llamaindex/Node";
import type { ServiceContext } from "llamaindex/ServiceContext";
import { serviceContextFromDefaults } from "llamaindex/ServiceContext";
import { Settings } from "llamaindex/Settings";
import type {
  RetrievalCallbackResponse,
  StreamCallbackResponse,
} from "llamaindex/callbacks/CallbackManager";
import { CallbackManager } from "llamaindex/callbacks/CallbackManager";
import { OpenAIEmbedding } from "llamaindex/embeddings/index";
import { SummaryIndex } from "llamaindex/indices/summary/index";
import { VectorStoreIndex } from "llamaindex/indices/vectorStore/index";
import { OpenAI } from "llamaindex/llm/openai";
import {
  ResponseSynthesizer,
  SimpleResponseBuilder,
} from "llamaindex/synthesizers/index";
import { mockEmbeddingModel, mockLlmGeneration } from "./utility/mockOpenAI.js";

describe("CallbackManager: onLLMStream and onRetrieve", () => {
  let serviceContext: ServiceContext;
  let streamCallbackData: StreamCallbackResponse[] = [];
  let retrieveCallbackData: RetrievalCallbackResponse[] = [];
  let document: Document;
  let callbackManager: CallbackManager;

  beforeAll(async () => {
    document = new Document({ text: "Author: My name is Paul Graham" });
    callbackManager = new CallbackManager({
      onLLMStream: (data) => {
        streamCallbackData.push(data);
      },
      onRetrieve: (data) => {
        retrieveCallbackData.push(data);
      },
    });

    const languageModel = new OpenAI({
      model: "gpt-3.5-turbo",
    });

    mockLlmGeneration({ languageModel, callbackManager });

    const embedModel = new OpenAIEmbedding();
    mockEmbeddingModel(embedModel);

    serviceContext = serviceContextFromDefaults({
      llm: languageModel,
      embedModel,
    });
  });

  beforeEach(() => {
    streamCallbackData = [];
    retrieveCallbackData = [];
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  test("For VectorStoreIndex w/ a SimpleResponseBuilder", async () => {
    const vectorStoreIndex = await VectorStoreIndex.fromDocuments([document], {
      serviceContext,
    });
    const queryEngine = vectorStoreIndex.asQueryEngine();
    const query = "What is the author's name?";
    const response = await Settings.withCallbackManager(callbackManager, () => {
      return queryEngine.query({ query });
    });

    expect(response.toString()).toBe("MOCK_TOKEN_1-MOCK_TOKEN_2");
    expect(streamCallbackData).toEqual([
      {
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
        index: 2,
        isDone: true,
      },
    ]);
    expect(retrieveCallbackData).toEqual([
      {
        query: query,
        nodes: expect.any(Array),
      },
    ]);
  });

  test("For SummaryIndex w/ a SummaryIndexRetriever", async () => {
    const summaryIndex = await SummaryIndex.fromDocuments([document], {
      serviceContext,
    });
    const responseBuilder = new SimpleResponseBuilder(serviceContext);
    const responseSynthesizer = new ResponseSynthesizer({
      serviceContext: serviceContext,
      responseBuilder,
    });
    const queryEngine = summaryIndex.asQueryEngine({
      responseSynthesizer,
    });
    const query = "What is the author's name?";
    const response = await Settings.withCallbackManager(
      callbackManager,
      async () => queryEngine.query({ query }),
    );
    expect(response.toString()).toBe("MOCK_TOKEN_1-MOCK_TOKEN_2");
    expect(streamCallbackData).toEqual([
      {
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
        index: 2,
        isDone: true,
      },
    ]);
    expect(retrieveCallbackData).toEqual([
      {
        query: query,
        nodes: expect.any(Array),
      },
    ]);
  });
});
