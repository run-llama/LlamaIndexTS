import { Document } from "@llamaindex/core/schema";
import { Settings } from "llamaindex";
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
import { SentenceSplitter } from "llamaindex/nodeParsers/index";
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
    const nodeParser = new SentenceSplitter();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const keywordExtractor = new KeywordExtractor({
      llm: serviceContext.llm,
      keywords: 5,
    });

    const nodesWithKeywordMetadata = await keywordExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0]!.metadata).toMatchObject({
      excerptKeywords: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });

  test("[MetadataExtractor] TitleExtractor returns documentTitle metadata", async () => {
    const nodeParser = new SentenceSplitter();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const titleExtractor = new TitleExtractor({
      llm: serviceContext.llm,
      nodes: 5,
    });

    const nodesWithKeywordMetadata = await titleExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0]!.metadata).toMatchObject({
      documentTitle: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });

  test("[MetadataExtractor] QuestionsAnsweredExtractor returns questionsThisExcerptCanAnswer metadata", async () => {
    const nodeParser = new SentenceSplitter();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const questionsAnsweredExtractor = new QuestionsAnsweredExtractor({
      llm: serviceContext.llm,
      questions: 5,
    });

    const nodesWithKeywordMetadata =
      await questionsAnsweredExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0]!.metadata).toMatchObject({
      questionsThisExcerptCanAnswer: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });

  test("[MetadataExtractor] QuestionsAnsweredExtractor uses custom prompt template", async () => {
    const nodeParser = new SentenceSplitter();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const llmCompleteSpy = vi.spyOn(serviceContext.llm, "complete");

    const questionsAnsweredExtractor = new QuestionsAnsweredExtractor({
      llm: serviceContext.llm,
      questions: 5,
      promptTemplate: ({ contextStr, numQuestions }) => {
        return `This is a custom prompt template for "${contextStr}" with ${numQuestions} questions`;
      },
    });

    await questionsAnsweredExtractor.processNodes(nodes);

    expect(llmCompleteSpy).toHaveBeenCalled();

    // Build the expected prompt
    const expectedPrompt = `This is a custom prompt template for "${DEFAULT_LLM_TEXT_OUTPUT}" with 5 questions`;

    // Get the actual prompt used in llm.complete
    const actualPrompt = llmCompleteSpy.mock?.calls?.[0]?.[0];

    // Assert that the prompts match
    expect(actualPrompt).toEqual({ prompt: expectedPrompt });
  });

  test("[MetadataExtractor] SumamryExtractor returns sectionSummary metadata", async () => {
    const nodeParser = new SentenceSplitter();

    const nodes = nodeParser.getNodesFromDocuments([
      new Document({ text: DEFAULT_LLM_TEXT_OUTPUT }),
    ]);

    const summaryExtractor = new SummaryExtractor({
      llm: serviceContext.llm,
    });

    const nodesWithKeywordMetadata = await summaryExtractor.processNodes(nodes);

    expect(nodesWithKeywordMetadata[0]!.metadata).toMatchObject({
      sectionSummary: DEFAULT_LLM_TEXT_OUTPUT,
    });
  });
});
