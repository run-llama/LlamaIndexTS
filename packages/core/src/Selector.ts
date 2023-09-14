import { LLM } from "./llm/LLM";
import { parseJsonMarkdown } from "./OutputParser";
import { buildToolsText, SimplePrompt } from "./Prompt";
import { ToolMetadata } from "./Tool";

//Selection interfaces
export interface Selection {
  answer: number;
  reason: string;
}

//Base interface for selectors
export interface BaseSelector {

  llm: LLM;
  prompt: SimplePrompt;
  max_outputs: number;

  /**
   * Selects 1 or more choices from several candidate query engines, using a LLM.
   * @param query
   * @param metadata
   */

  //In the Python side, they have multiple selectors for single and multiple.
  //We'll try to implement one where we only need a single class for both.
  select(
    query: string,
    metadata: ToolMetadata[]
  ): Promise<Selection[]>;
}

export class LLMSelector implements BaseSelector {
  llm: LLM;
  prompt: SimplePrompt;
  max_outputs: number;

  //We want to specify a function that returns a string
  constructor(llm: LLM, prompt: SimplePrompt, max_outputs = 1) {
    this.llm = llm;
    this.prompt = prompt;
    this.max_outputs = max_outputs;
  }
  async select(
    query: string,
    metadata: ToolMetadata[]
  ): Promise<Selection[]> {
    //Depending on if we have the single or multi-select case, change input object to prompt.
    var input;
    if (this.max_outputs > 1) {
      input = {
        context: buildToolsText(metadata),
        query: query,
        branching_factor: this.max_outputs.toString(),
      };
    } else {
      input = { context: buildToolsText(metadata), query: query };
    }
    const selections: Selection[] = parseJsonMarkdown(
      (await this.llm.complete(this.prompt(input))).message.content,
    );
    return selections;
  }
}
