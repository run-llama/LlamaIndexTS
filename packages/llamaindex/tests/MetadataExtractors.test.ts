import { Settings } from "llamaindex";
import { Document } from "llamaindex/Node";
import type { ServiceContext } from "llamaindex/ServiceContext";
import { serviceContextFromDefaults } from "llamaindex/ServiceContext";
import { OpenAIEmbedding } from "llamaindex/embeddings/index";
import {
  KeywordExtractor,
  QuestionsAnsweredExtractor,
  SummaryExtractor,
  TitleExtractor,
} from "llamaindex/extractors/index";
import { OpenAI } from "llamaindex/llm/openai";
import { SimpleNodeParser } from "llamaindex/nodeParsers/index";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import {
  DEFAULT_LLM_TEXT_OUTPUT,
  mockEmbeddingModel,
  mockLlmGeneration,
} from "./utility/mockOpenAI.js";

describe("[MetadataExtractor]: Extractors should populate the metadata", () => {
  let serviceContext: ServiceContext;

  beforeAll(async () => {
    const languageModel = new OpenAI({
      model: "gpt-3.5-turbo",
    });

    Settings.llm = languageModel;

    mockLlmGeneration({ languageModel });

    const embedModel = new OpenAIEmbedding();

    mockEmbeddingModel(embedModel);

    serviceContext = serviceContextFromDefaults({
      llm: languageModel,
      embedModel,
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  test("[MetadataExtractor] KeywordExtractor returns excerptKeywords metadata", async () => {
    const nodeParser = new SimpleNodeParser();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const keywordExtractor = new KeywordExtractor({
      llm: serviceContext.llm,
      keywords: 5,
    });

    const nodesWithKeywordMetadata = await keywordExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0].metadata).toMatchObject({
      excerptKeywords: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });

  test("[MetadataExtractor] TitleExtractor returns documentTitle metadata", async () => {
    const nodeParser = new SimpleNodeParser();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const titleExtractor = new TitleExtractor({
      llm: serviceContext.llm,
      nodes: 5,
    });

    const nodesWithKeywordMetadata = await titleExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0].metadata).toMatchObject({
      documentTitle: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });

  test("[MetadataExtractor] QuestionsAnsweredExtractor returns questionsThisExcerptCanAnswer metadata", async () => {
    const nodeParser = new SimpleNodeParser();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const questionsAnsweredExtractor = new QuestionsAnsweredExtractor({
      llm: serviceContext.llm,
      questions: 5,
    });

    const nodesWithKeywordMetadata =
      await questionsAnsweredExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0].metadata).toMatchObject({
      questionsThisExcerptCanAnswer: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });

  test("[MetadataExtractor] SumamryExtractor returns sectionSummary metadata", async () => {
    const nodeParser = new SimpleNodeParser();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const summaryExtractor = new SummaryExtractor({
      llm: serviceContext.llm,
    });

    const nodesWithKeywordMetadata = await summaryExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0].metadata).toMatchObject({
      sectionSummary: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });
});
