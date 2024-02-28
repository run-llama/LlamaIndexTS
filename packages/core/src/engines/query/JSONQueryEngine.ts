import jsonpath from "jsonpath";
import { Response } from "../../Response.js";
import {
  serviceContextFromDefaults,
  type ServiceContext,
} from "../../ServiceContext.js";
import type {
  BaseQueryEngine,
  QueryEngineParamsNonStreaming,
  QueryEngineParamsStreaming,
} from "../../types.js";
import {
  defaultJsonPathPrompt,
  defaultResponseSynthesizePrompt,
  type JSONPathPrompt,
  type ResponseSynthesisPrompt,
} from "./prompts.js";

export type JSONSchemaType = Record<string, unknown>;

function removeExtraQuotes(expr: string) {
  let startIndex = 0;
  let endIndex = expr.length;

  // Trim the leading backticks and single quotes
  while (
    startIndex < endIndex &&
    (expr[startIndex] === "`" || expr[startIndex] === "'")
  ) {
    startIndex++;
  }

  // Trim the trailing backticks and single quotes
  while (
    endIndex > startIndex &&
    (expr[endIndex - 1] === "`" || expr[endIndex - 1] === "'")
  ) {
    endIndex--;
  }

  // Return the trimmed substring
  return expr.substring(startIndex, endIndex);
}

export const defaultOutputProcessor = async ({
  llmOutput,
  jsonValue,
}: {
  llmOutput: string;
  jsonValue: JSONSchemaType;
}): Promise<Record<string, unknown>[]> => {
  const expressions = llmOutput
    .split(",")
    .map((expr) => removeExtraQuotes(expr.trim()));

  const results: Record<string, unknown>[] = [];

  for (const expression of expressions) {
    // get the key for example content from $.content
    const key = expression.split(".").pop();

    try {
      const datums = jsonpath.query(jsonValue, expression);

      if (!key) throw new Error(`Invalid JSON Path: ${expression}`);

      for (const datum of datums) {
        // in case there is a filter like [?(@.username=='simon')] without a key ie: $..comments[?(@.username=='simon').content]
        if (key.includes("==")) {
          results.push(datum);
          continue;
        }

        results.push({
          [key]: datum,
        });
      }
    } catch (err) {
      throw new Error(`Invalid JSON Path: ${expression}`);
    }
  }

  return results;
};

type OutputProcessor = typeof defaultOutputProcessor;

/**
 * A JSON query engine that uses JSONPath to query a JSON object.
 */
export class JSONQueryEngine implements BaseQueryEngine {
  jsonValue: JSONSchemaType;
  jsonSchema: JSONSchemaType;
  serviceContext: ServiceContext;
  outputProcessor: OutputProcessor;
  verbose: boolean;
  jsonPathPrompt: JSONPathPrompt;
  synthesizeResponse: boolean;
  responseSynthesisPrompt: ResponseSynthesisPrompt;

  constructor(init: {
    jsonValue: JSONSchemaType;
    jsonSchema: JSONSchemaType;
    serviceContext?: ServiceContext;
    jsonPathPrompt?: JSONPathPrompt;
    outputProcessor?: OutputProcessor;
    synthesizeResponse?: boolean;
    responseSynthesisPrompt?: ResponseSynthesisPrompt;
    verbose?: boolean;
  }) {
    this.jsonValue = init.jsonValue;
    this.jsonSchema = init.jsonSchema;
    this.serviceContext = init.serviceContext ?? serviceContextFromDefaults({});
    this.jsonPathPrompt = init.jsonPathPrompt ?? defaultJsonPathPrompt;
    this.outputProcessor = init.outputProcessor ?? defaultOutputProcessor;
    this.verbose = init.verbose ?? false;
    this.synthesizeResponse = init.synthesizeResponse ?? true;
    this.responseSynthesisPrompt =
      init.responseSynthesisPrompt ?? defaultResponseSynthesizePrompt;
  }

  getPrompts(): Record<string, unknown> {
    return {
      jsonPathPrompt: this.jsonPathPrompt,
      responseSynthesisPrompt: this.responseSynthesisPrompt,
    };
  }

  updatePrompts(prompts: {
    jsonPathPrompt?: JSONPathPrompt;
    responseSynthesisPrompt?: ResponseSynthesisPrompt;
  }): void {
    if (prompts.jsonPathPrompt) {
      this.jsonPathPrompt = prompts.jsonPathPrompt;
    }
    if (prompts.responseSynthesisPrompt) {
      this.responseSynthesisPrompt = prompts.responseSynthesisPrompt;
    }
  }

  getPromptModules(): Record<string, unknown> {
    return {};
  }

  getSchemaContext(): string {
    return JSON.stringify(this.jsonSchema);
  }

  query(params: QueryEngineParamsStreaming): Promise<AsyncIterable<Response>>;
  query(params: QueryEngineParamsNonStreaming): Promise<Response>;
  async query(
    params: QueryEngineParamsStreaming | QueryEngineParamsNonStreaming,
  ): Promise<Response | AsyncIterable<Response>> {
    const { query, stream } = params;

    if (stream) {
      throw new Error("Streaming is not supported");
    }

    const schema = this.getSchemaContext();

    const jsonPathResponseStr = await this.serviceContext.llm.complete({
      prompt: this.jsonPathPrompt({ query, schema }),
    });

    if (this.verbose) {
      console.log(
        `> JSONPath Instructions:\n\`\`\`\n${jsonPathResponseStr}\n\`\`\`\n`,
      );
    }

    const jsonPathOutput = await this.outputProcessor({
      llmOutput: jsonPathResponseStr.text,
      jsonValue: this.jsonValue,
    });

    if (this.verbose) {
      console.log(`> JSONPath Output: ${jsonPathOutput}\n`);
    }

    let responseStr;

    if (this.synthesizeResponse) {
      responseStr = await this.serviceContext.llm.complete({
        prompt: this.responseSynthesisPrompt({
          query,
          jsonSchema: schema,
          jsonPath: jsonPathResponseStr.text,
          jsonPathValue: JSON.stringify(jsonPathOutput),
        }),
      });

      responseStr = responseStr.text;
    } else {
      responseStr = JSON.stringify(jsonPathOutput);
    }

    const responseMetadata = {
      jsonPathResponseStr,
    };

    const response = new Response(responseStr, []);

    response.metadata = responseMetadata;

    return response;
  }
}
