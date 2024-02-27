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

const defaultOutputProcessor = async ({
  llmOutput,
  jsonValue,
}: {
  llmOutput: string;
  jsonValue: JSONSchemaType;
}): Promise<Record<string, unknown>[]> => {
  const expressions = llmOutput
    .split(",")
    .map((expr) => expr.trim().replace(/^[`']+|[`']+$/g, ""));

  const results: Record<string, unknown>[] = [];

  for (const expression of expressions) {
    try {
      const datums = jsonpath.query(jsonValue, expression);

      if (datums) {
        results.push(...datums);
      }
    } catch (err) {
      throw new Error(`Invalid JSON Path: ${expression}`);
    }
  }

  return results;
};

type OutputProcessor = typeof defaultOutputProcessor;

export class JSONQueryEngine implements BaseQueryEngine {
  jsonValue: JSONSchemaType;
  jsonSchema: JSONSchemaType;
  serviceContext: ServiceContext;
  outputProcessor: OutputProcessor;
  outputKwargs: Record<string, unknown>;
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
    outputKwargs?: Record<string, unknown>;
    synthesizeResponse?: boolean;
    responseSynthesisPrompt?: ResponseSynthesisPrompt;
    verbose?: boolean;
  }) {
    this.jsonValue = init.jsonValue;
    this.jsonSchema = init.jsonSchema;
    this.serviceContext = init.serviceContext ?? serviceContextFromDefaults({});
    this.jsonPathPrompt = init.jsonPathPrompt ?? defaultJsonPathPrompt;
    this.outputProcessor = init.outputProcessor ?? defaultOutputProcessor;
    this.outputKwargs = init.outputKwargs ?? {};
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
      ...this.outputKwargs,
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
