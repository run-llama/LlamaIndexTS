import { SubQuestion } from "./QuestionGenerator";

/**
 * An OutputParser is used to extract structured data from the raw output of the LLM.
 */
export interface BaseOutputParser<T> {
  parse(output: string): T;
  format(output: string): string;
}

/**
 * StructuredOutput is just a combo of the raw output and the parsed output.
 */
export interface StructuredOutput<T> {
  rawOutput: string;
  parsedOutput: T;
}

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
function parseJsonMarkdown(text: string) {
  text = text.trim();

  const beginDelimiter = "```json";
  const endDelimiter = "```";

  const beginIndex = text.indexOf(beginDelimiter);
  const endIndex = text.indexOf(
    endDelimiter,
    beginIndex + beginDelimiter.length,
  );
  if (beginIndex === -1 || endIndex === -1) {
    throw new OutputParserError("Not a json markdown", { output: text });
  }

  const jsonText = text.substring(beginIndex + beginDelimiter.length, endIndex);

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    throw new OutputParserError("Not a valid json", {
      cause: e as Error,
      output: text,
    });
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
