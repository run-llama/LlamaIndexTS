import type { LLM } from "../llm/index.js";
import type { Answer } from "../outputParsers/selectors.js";
import { SelectionOutputParser } from "../outputParsers/selectors.js";
import type {
  BaseOutputParser,
  QueryBundle,
  StructuredOutput,
  ToolMetadataOnlyDescription,
} from "../types.js";
import type { SelectorResult } from "./base.js";
import { BaseSelector } from "./base.js";
import type {
  MultiSelectPromptTemplate,
  SingleSelectPromptTemplate,
} from "./prompts.js";
import {
  defaultMultiSelectPromptTemplate,
  defaultSingleSelectPromptTemplate,
} from "./prompts.js";

function buildChoicesText(choices: ToolMetadataOnlyDescription[]): string {
  const texts: string[] = [];
  for (const [ind, choice] of choices.entries()) {
    let text = choice.description.split("\n").join(" ");
    text = `(${ind + 1}) ${text}`; // to one indexing
    texts.push(text);
  }
  return texts.join("");
}

function structuredOutputToSelectorResult(
  output: StructuredOutput<Answer[]>,
): SelectorResult {
  const structuredOutput = output;
  const answers = structuredOutput.parsedOutput;

  // adjust for zero indexing
  const selections = answers.map((answer: any) => {
    return { index: answer.choice - 1, reason: answer.reason };
  });

  return { selections };
}

type LLMPredictorType = LLM;

/**
 * A selector that uses the LLM to select a single or multiple choices from a list of choices.
 */
export class LLMMultiSelector extends BaseSelector {
  llm: LLMPredictorType;
  prompt: MultiSelectPromptTemplate;
  maxOutputs: number;
  outputParser: BaseOutputParser<StructuredOutput<Answer[]>> | null;

  constructor(init: {
    llm: LLMPredictorType;
    prompt?: MultiSelectPromptTemplate;
    maxOutputs?: number;
    outputParser?: BaseOutputParser<StructuredOutput<Answer[]>>;
  }) {
    super();
    this.llm = init.llm;
    this.prompt = init.prompt ?? defaultMultiSelectPromptTemplate;
    this.maxOutputs = init.maxOutputs ?? 10;

    this.outputParser = init.outputParser ?? new SelectionOutputParser();
  }

  _getPrompts(): Record<string, MultiSelectPromptTemplate> {
    return { prompt: this.prompt };
  }

  _updatePrompts(prompts: Record<string, MultiSelectPromptTemplate>): void {
    if ("prompt" in prompts) {
      this.prompt = prompts.prompt;
    }
  }

  /**
   * Selects a single choice from a list of choices.
   * @param choices
   * @param query
   */
  async _select(
    choices: ToolMetadataOnlyDescription[],
    query: QueryBundle,
  ): Promise<SelectorResult> {
    const choicesText = buildChoicesText(choices);

    const prompt = this.prompt.format({
      numChoices: choicesText.length,
      contextList: choicesText,
      queryStr: query.queryStr,
      maxOutputs: this.maxOutputs,
    });

    const formattedPrompt = this.outputParser?.format(prompt);

    if (!formattedPrompt) {
      throw new Error("Formatted prompt is undefined");
    }

    const prediction = await this.llm.complete({
      prompt: formattedPrompt,
    });

    const parsed = this.outputParser?.parse(prediction.text);

    if (!parsed) {
      throw new Error("Parsed output is undefined");
    }

    return structuredOutputToSelectorResult(parsed);
  }

  asQueryComponent(): unknown {
    throw new Error("Method not implemented.");
  }
}

/**
 * A selector that uses the LLM to select a single choice from a list of choices.
 */
export class LLMSingleSelector extends BaseSelector {
  llm: LLMPredictorType;
  prompt: SingleSelectPromptTemplate;
  outputParser: BaseOutputParser<StructuredOutput<Answer[]>> | null;

  constructor(init: {
    llm: LLMPredictorType;
    prompt?: SingleSelectPromptTemplate;
    outputParser?: BaseOutputParser<StructuredOutput<Answer[]>>;
  }) {
    super();
    this.llm = init.llm;
    this.prompt = init.prompt ?? defaultSingleSelectPromptTemplate;
    this.outputParser = init.outputParser ?? new SelectionOutputParser();
  }

  _getPrompts(): Record<string, SingleSelectPromptTemplate> {
    return { prompt: this.prompt };
  }

  _updatePrompts(prompts: Record<string, SingleSelectPromptTemplate>): void {
    if ("prompt" in prompts) {
      this.prompt = prompts.prompt;
    }
  }

  /**
   * Selects a single choice from a list of choices.
   * @param choices
   * @param query
   */
  async _select(
    choices: ToolMetadataOnlyDescription[],
    query: QueryBundle,
  ): Promise<SelectorResult> {
    const choicesText = buildChoicesText(choices);

    const prompt = this.prompt.format({
      numChoices: choicesText.length,
      contextList: choicesText,
      queryStr: query.queryStr,
    });

    const formattedPrompt = this.outputParser?.format(prompt);

    if (!formattedPrompt) {
      throw new Error("Formatted prompt is undefined");
    }

    const prediction = await this.llm.complete({
      prompt: formattedPrompt,
    });

    const parsed = this.outputParser?.parse(prediction.text);

    if (!parsed) {
      throw new Error("Parsed output is undefined");
    }

    return structuredOutputToSelectorResult(parsed);
  }

  asQueryComponent(): unknown {
    throw new Error("Method not implemented.");
  }
}
