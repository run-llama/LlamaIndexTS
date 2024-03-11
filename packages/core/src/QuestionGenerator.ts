import { SubQuestionOutputParser } from "./OutputParser.js";
import type { SubQuestionPrompt } from "./Prompt.js";
import { buildToolsText, defaultSubQuestionPrompt } from "./Prompt.js";
import type {
  BaseQuestionGenerator,
  SubQuestion,
} from "./engines/query/types.js";
import { OpenAI } from "./llm/LLM.js";
import type { LLM } from "./llm/types.js";
import { PromptMixin } from "./prompts/index.js";
import type {
  BaseOutputParser,
  StructuredOutput,
  ToolMetadata,
} from "./types.js";

/**
 * LLMQuestionGenerator uses the LLM to generate new questions for the LLM using tools and a user query.
 */
export class LLMQuestionGenerator
  extends PromptMixin
  implements BaseQuestionGenerator
{
  llm: LLM;
  prompt: SubQuestionPrompt;
  outputParser: BaseOutputParser<StructuredOutput<SubQuestion[]>>;

  constructor(init?: Partial<LLMQuestionGenerator>) {
    super();

    this.llm = init?.llm ?? new OpenAI();
    this.prompt = init?.prompt ?? defaultSubQuestionPrompt;
    this.outputParser = init?.outputParser ?? new SubQuestionOutputParser();
  }

  protected _getPrompts(): { [x: string]: SubQuestionPrompt } {
    return {
      subQuestion: this.prompt,
    };
  }

  protected _updatePrompts(promptsDict: {
    subQuestion: SubQuestionPrompt;
  }): void {
    if ("subQuestion" in promptsDict) {
      this.prompt = promptsDict.subQuestion;
    }
  }

  async generate(tools: ToolMetadata[], query: string): Promise<SubQuestion[]> {
    const toolsStr = buildToolsText(tools);
    const queryStr = query;
    const prediction = (
      await this.llm.complete({
        prompt: this.prompt({
          toolsStr,
          queryStr,
        }),
      })
    ).text;

    const structuredOutput = this.outputParser.parse(prediction);

    return structuredOutput.parsedOutput;
  }
}
