import { SubQuestion } from "./QuestionGenerator";

export interface BaseOutputParser<T> {
  parse(output: string): T;
  format(output: string): string;
}

export interface StructuredOutput<T> {
  rawOutput: string;
  parsedOutput: T;
}

class OutputParserError extends Error {
  cause: Error | undefined;
  output: string | undefined;

  constructor(
    message: string,
    options: { cause?: Error; output?: string } = {}
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

function parseJsonMarkdown(text: string) {
  text = text.trim();

  const beginDelimiter = "```json";
  const endDelimiter = "```";

  const beginIndex = text.indexOf(beginDelimiter);
  const endIndex = text.indexOf(
    endDelimiter,
    beginIndex + beginDelimiter.length
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
