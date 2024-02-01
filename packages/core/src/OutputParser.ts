import { SubQuestion } from "./engines/query/types";
import { BaseOutputParser, StructuredOutput } from "./types";

/**
 * Error class for output parsing. Due to the nature of LLMs, anytime we use LLM
 * to generate structured output, it's possible that it will hallucinate something
 * that doesn't match the expected output format. So make sure to catch these
 * errors in production.
 */
class OutputParserError extends Error {
  cause: Error | undefined;
  output: string | undefined;

  constructor(
    message: string,
    options: { cause?: Error; output?: string } = {},
  ) {
    // @ts-ignore
    super(message, options); // https://github.com/tc39/proposal-error-cause
    this.name = "OutputParserError";

    if (!this.cause) {
      // Need to check for those environments that have implemented the proposal
      this.cause = options.cause;
    }
    this.output = options.output;

    // This line is to maintain proper stack trace in V8
    // (https://v8.dev/docs/stack-trace-api)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OutputParserError);
    }
  }
}

/**
 *
 * @param text A markdown block with JSON
 * @returns parsed JSON object
 */
export function parseJsonMarkdown(text: string) {
  text = text.trim();

  const left_square = text.indexOf("[");
  const left_brace = text.indexOf("{");

  var left: number;
  var right: number;
  if (left_square < left_brace && left_square != -1) {
    left = left_square;
    right = text.lastIndexOf("]");
  } else {
    left = left_brace;
    right = text.lastIndexOf("}");
  }
  const jsonText = text.substring(left, right + 1);
  try {
    //Single JSON object case
    if (left_square === -1) {
      return [JSON.parse(jsonText)];
    }
    //Multiple JSON object case.
    return JSON.parse(jsonText);
  } catch (e) {
    throw new OutputParserError("Not a json markdown", { output: text });
  }
}

/**
 * SubQuestionOutputParser is used to parse the output of the SubQuestionGenerator.
 */
export class SubQuestionOutputParser
  implements BaseOutputParser<StructuredOutput<SubQuestion[]>>
{
  parse(output: string): StructuredOutput<SubQuestion[]> {
    const parsed = parseJsonMarkdown(output);

    // TODO add zod validation

    return { rawOutput: output, parsedOutput: parsed };
  }

  format(output: string): string {
    return output;
  }
}
