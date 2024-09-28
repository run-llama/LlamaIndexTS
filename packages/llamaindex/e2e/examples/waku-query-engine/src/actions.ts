"use server";
import { StartEvent, StopEvent, Workflow } from "@llamaindex/core/workflow";
import { createStreamableUI } from "ai/rsc";
import {
  BaseQueryEngine,
  Document,
  EngineResponse,
  OpenAI,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import { readFile } from "node:fs/promises";
import type { ReactNode } from "react";
let _queryEngine: BaseQueryEngine;

Settings.llm = new OpenAI({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  apiKey: process.env.OPENAPI_KEY,
});

async function lazyLoadQueryEngine() {
  if (!_queryEngine) {
    const path = "node_modules/llamaindex/examples/abramov.txt";

    const essay = await readFile(path, "utf-8");

    // Create Document object with essay
    const document = new Document({ text: essay, id_: path });

    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments([document]);

    _queryEngine = index.asQueryEngine();
  }
  return _queryEngine;
}

type Context = {
  queryEngine: Promise<BaseQueryEngine>;
  ui: ReturnType<typeof createStreamableUI>;
};

const defaultContext: Context = {
  get queryEngine() {
    return lazyLoadQueryEngine();
  },
  ui: null!,
};

const workflow = new Workflow<string, ReactNode, unknown>().with<Context>(
  defaultContext,
);

async function engineResponseUI(
  ui: ReturnType<typeof createStreamableUI>,
  stream: AsyncIterable<EngineResponse>,
) {
  for await (const response of stream) {
    ui.append(`${response.message.content}`);
  }
  ui.done();
}

workflow.addStep(StartEvent, async (context, event) => {
  const queryEngine = await context.queryEngine;
  context.ui.update("Querying...");
  const stream = await queryEngine.query({
    query: event.data.input,
    stream: true,
  });
  const responseUI = createStreamableUI();
  engineResponseUI(responseUI, stream).catch(console.error);
  return new StopEvent({
    result: responseUI.value,
  });
});

export async function chatWithAI(question: string): Promise<ReactNode> {
  "use server";
  const uiWrapper = createStreamableUI();
  const context = workflow.run(question).with({
    ...defaultContext,
    ui: uiWrapper,
  });
  context
    .then((event) => {
      uiWrapper.done(event.data.result);
    })
    .catch(() => {
      uiWrapper.error("Error");
    });
  return uiWrapper.value;
}
