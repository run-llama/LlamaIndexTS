import { Document } from "../Node";
import { ServiceContext, serviceContextFromDefaults } from "../ServiceContext";
import {
  CallbackManager,
  RetrievalCallbackResponse,
  StreamCallbackResponse,
} from "../callbacks/CallbackManager";
import { OpenAIEmbedding } from "../embeddings";
import { KeywordExtractor } from "../extractors";
import { OpenAI } from "../llm/LLM";
import { SimpleNodeParser } from "../nodeParsers";
import {
  DEFAULT_LLM_TEXT_OUTPUT,
  mockEmbeddingModel,
  mockLlmGeneration,
} from "./utility/mockOpenAI";

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

  beforeAll(async () => {
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

  test("[MetadataExtractor] KeywordExtractor returns excerptKeywords metadata", async () => {
    const nodeParser = new SimpleNodeParser();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const keywordExtractor = new KeywordExtractor(serviceContext.llm, 5);

    const nodesWithKeywordMetadata = await keywordExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0].metadata).toMatchObject({
      excerptKeywords: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });
});
