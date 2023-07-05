import { SubQuestion } from "./QuestionGenerator";

interface BaseOutputParser {
  parse(output: string): any;
  format(output: string): string;
}

interface StructuredOutput {
  rawOutput: string;
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

class SubQuestionOutputParser implements BaseOutputParser {
  parse(output: string): SubQuestion[] {
    const subQuestions = JSON.parse(output);
    return subQuestions;
  }

  format(output: string): string {
    return output;
  }
}
