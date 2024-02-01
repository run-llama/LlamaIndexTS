import { DefaultPromptTemplate } from "../extractors/prompts";
import { LLM } from "../llm";
import { Answer, SelectionOutputParser } from "../outputParsers/selectors";
import {
  BaseOutputParser,
  QueryBundle,
  StructuredOutput,
  ToolMetadataOnlyDescription,
} from "../types";
import { BaseSelector, SelectorResult } from "./base";
import { defaultSingleSelectPrompt } from "./prompts";

function buildChoicesText(choices: ToolMetadataOnlyDescription[]): string {
  const texts: string[] = [];
  for (const [ind, choice] of choices.entries()) {
    let text = choice.description.split("\n").join(" ");
    text = `(${ind + 1}) ${text}`; // to one indexing
    texts.push(text);
  }
  return texts.join("");
}

function _structuredOutputToSelectorResult(
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
  _llm: LLMPredictorType;
  _prompt: DefaultPromptTemplate | undefined;
  _maxOutputs: number | null;
  _outputParser: BaseOutputParser<any> | null;

  constructor(init: {
    llm: LLMPredictorType;
    prompt?: DefaultPromptTemplate;
    maxOutputs?: number;
    outputParser?: BaseOutputParser<any>;
  }) {
    super();
    this._llm = init.llm;
    this._prompt = init.prompt;
    this._maxOutputs = init.maxOutputs ?? null;

    this._outputParser = init.outputParser ?? new SelectionOutputParser();
  }

  _getPrompts(): Record<string, any> {
    return { prompt: this._prompt };
  }

  _updatePrompts(prompts: Record<string, any>): void {
    if ("prompt" in prompts) {
      this._prompt = prompts.prompt;
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

    const prompt =
      this._prompt?.contextStr ??
      defaultSingleSelectPrompt(
        choicesText.length,
        choicesText,
        query.queryStr,
      );
    const formattedPrompt = this._outputParser?.format(prompt);

    const prediction = await this._llm.complete({
      prompt: formattedPrompt,
    });

    const parsed = this._outputParser?.parse(prediction.text);

    return _structuredOutputToSelectorResult(parsed);
  }

  asQueryComponent(): unknown {
    throw new Error("Method not implemented.");
  }
}

/**
 * A selector that uses the LLM to select a single choice from a list of choices.
 */
export class LLMSingleSelector extends BaseSelector {
  _llm: LLMPredictorType;
  _prompt: DefaultPromptTemplate | undefined;
  _outputParser: BaseOutputParser<any> | null;

  constructor(init: {
    llm: LLMPredictorType;
    prompt?: DefaultPromptTemplate;
    outputParser?: BaseOutputParser<any>;
  }) {
    super();
    this._llm = init.llm;
    this._prompt = init.prompt;
    this._outputParser = init.outputParser ?? new SelectionOutputParser();
  }

  _getPrompts(): Record<string, any> {
    return { prompt: this._prompt };
  }

  _updatePrompts(prompts: Record<string, any>): void {
    if ("prompt" in prompts) {
      this._prompt = prompts.prompt;
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

    const prompt =
      this._prompt?.contextStr ??
      defaultSingleSelectPrompt(
        choicesText.length,
        choicesText,
        query.queryStr,
      );

    const formattedPrompt = this._outputParser?.format(prompt);

    const prediction = await this._llm.complete({
      prompt: formattedPrompt,
    });

    const parsed = this._outputParser?.parse(prediction.text);

    return _structuredOutputToSelectorResult(parsed);
  }

  asQueryComponent(): unknown {
    throw new Error("Method not implemented.");
  }
}
