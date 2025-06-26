import type { LLM, MessageType } from "../../llms";
import type { MemoryMessage } from "../types";
import { BaseMemoryBlock, type MemoryBlockOptions } from "./base";

const DEFAULT_EXTRACTION_PROMPT = `
You are a precise fact extraction system designed to identify key information from conversations.

CONVERSATION SEGMENT:
{{conversation}}

EXISTING FACTS:
{{existing_facts}}

INSTRUCTIONS: 
1. Review the conversation segment provided above.
2. Extract specific, concrete facts the user has disclosed or important information discovered
3. Focus on factual information like preferences, personal details, requirements, constraints, or context
4. Do not include opinions, summaries, or interpretations - only extract explicit information
5. Do not duplicate facts that are already in the existing facts list

Respond with the new facts from the conversation segment using the following JSON format:
{
  "facts": ["fact1", "fact2", "fact3", ...]
}
`;

const DEFAULT_SUMMARY_PROMPT = `
You are a precise fact condensing system designed to summarize facts in a concise manner.

EXISTING FACTS:
{{existing_facts}}

INSTRUCTIONS:
1. Review the current list of existing facts
2. Condense the facts into a more concise list, less than {{ max_facts }} facts
3. Focus on factual information like preferences, personal details, requirements, constraints, or context
4. Do not include opinions, summaries, or interpretations - only extract explicit information
5. Do not duplicate facts that are already in the existing facts list

Respond with the condensed facts using the following JSON format:
{
  "facts": ["fact1", "fact2", "fact3", ...]
}
`;

/**
 * The options for the fact extraction memory block.
 */
export type FactExtractionMemoryBlockOptions = {
  /**
   * The fact extraction model to use.
   */
  llm: LLM;
  /**
   * The maximum number of facts to extract.
   */
  maxFacts: number;
  /**
   * The prompt to use for fact extraction.
   */
  extractionPrompt?: string;
  /**
   * The prompt to use for fact summary.
   */
  summaryPrompt?: string;
} & MemoryBlockOptions & {
    isLongTerm?: true;
  };

/**
 * A memory block that stores facts extracted from conversations.
 */
export class FactExtractionMemoryBlock<
  TAdditionalMessageOptions extends object = object,
> extends BaseMemoryBlock<TAdditionalMessageOptions> {
  private readonly llm: LLM;
  private facts: string[] = [];
  private readonly maxFacts: number;
  private readonly extractionPrompt: string;
  private readonly summaryPrompt: string;

  constructor(options: FactExtractionMemoryBlockOptions) {
    super(options);
    this.llm = options.llm;
    this.maxFacts = options.maxFacts;
    this.extractionPrompt =
      options.extractionPrompt ?? DEFAULT_EXTRACTION_PROMPT;
    this.summaryPrompt = options.summaryPrompt ?? DEFAULT_SUMMARY_PROMPT;
  }

  async get(): Promise<MemoryMessage<TAdditionalMessageOptions>[]> {
    const fact = {
      id: this.id,
      content: this.facts.join("\n"),
      role: "user" as MessageType, // Use user for the fact message
    };
    return [fact];
  }

  async put(
    messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<void> {
    if (messages.length === 0) {
      return;
    }
    // Format existing facts
    const existingFactsStr = `{ facts: [${this.facts.join(", ")}] }`;
    // Format conversation
    const conversation = `\n\t${messages.map((m) => m.content).join("\n\t")}`;
    // Format prompt
    const prompt = this.extractionPrompt
      .replace("{{conversation}}", conversation)
      .replace("{{existing_facts}}", existingFactsStr);
    // Call the LLM
    const response = await this.llm.complete({
      prompt,
    });
    // Parse and validate the response
    const newFacts = JSON.parse(response.text);
    if (
      newFacts.facts === undefined ||
      !Array.isArray(newFacts.facts) ||
      newFacts.facts.length === 0
    ) {
      throw new Error("Invalid response from LLM");
    }
    // Update the facts
    this.facts.push(...newFacts.facts);

    // Condense the facts
    if (this.facts.length > this.maxFacts) {
      const existingFactsStr = `{ facts: [${this.facts.join(", ")}] }`;
      const prompt = this.summaryPrompt
        .replace("{{existing_facts}}", existingFactsStr)
        .replace("{{max_facts}}", this.maxFacts.toString());
      const response = await this.llm.complete({
        prompt,
      });
      const condensedFacts = JSON.parse(response.text);
      if (
        condensedFacts.facts === undefined ||
        !Array.isArray(condensedFacts.facts) ||
        condensedFacts.facts.length === 0
      ) {
        throw new Error("Invalid response from LLM");
      }
      // Only get the first maxFacts facts (in case the LLM returned more)
      this.facts = condensedFacts.facts.slice(0, this.maxFacts);
    }
  }
}
