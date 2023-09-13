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
  /**
   * Selects 1 or more choices from several candidate query engines, using a LLM.
   * @param query
   * @param metadata
   * @param num_selections
   */

  //In the Python side, they have multiple selectors for single and multiple.
  //We'll try to implement one where we only need a single class for both.
  select(
    query: string,
    metadata: ToolMetadata[],
    num_selections?: number,
  ): Promise<Selection[]>;
}

export class LLMSelector implements BaseSelector {
  llm: LLM;
  prompt: SimplePrompt;

  //We want to specify a function that returns a string
  constructor(llm: LLM, prompt: SimplePrompt) {
    this.llm = llm;
    this.prompt = prompt;
  }
  async select(
    query: string,
    metadata: ToolMetadata[],
    num_selections = 1,
  ): Promise<Selection[]> {
    //Depending on if we have the single or multi-select case, change input object to prompt.
    var input;
    if (num_selections > 1) {
      input = {
        context: buildToolsText(metadata),
        query: query,
        branching_factor: num_selections.toString(),
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
