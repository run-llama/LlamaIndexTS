import { ClientMDXContent } from "@/components/mdx";
import { BotMessage } from "@/components/message";
import { Skeleton } from "@/components/ui/skeleton";
import { LlamaCloudRetriever } from "@/deps/cloud";
import { Settings } from "@llamaindex/core/global";
import { ChatMessage } from "@llamaindex/core/llms";
import { RetrieverQueryEngine } from "@llamaindex/core/query-engine";
import { OpenAI } from "@llamaindex/openai";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { ReactNode } from "react";

Settings.llm = new OpenAI({
  model: "gpt-4o",
});

const retriever = new LlamaCloudRetriever({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  apiKey: process.env.LLAMA_CLOUD_API_KEY!,
  baseUrl: "https://api.cloud.llamaindex.ai/",
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  pipelineId: process.env.LLAMA_CLOUD_PIPELINE_ID!,
});

const initialAIState = {
  messages: [],
} as {
  messages: ChatMessage[];
};

type UIMessage = {
  id: number;
  display: ReactNode;
};

const initialUIState = {
  messages: [],
} as {
  messages: UIMessage[];
};

const runAsyncFnWithoutBlocking = (fn: (...args: any) => Promise<any>) => {
  fn().catch((error) => {
    console.error(error);
  });
};

export const AIProvider = createAI({
  initialAIState,
  initialUIState,
  actions: {
    query: async (message: string): Promise<UIMessage> => {
      "use server";
      const queryEngine = new RetrieverQueryEngine(retriever);

      const id = Date.now();
      const aiState = getMutableAIState<typeof AIProvider>();
      aiState.update({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            role: "user",
            content: message,
          },
        ],
      });

      const ui = createStreamableUI(
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>,
      );

      runAsyncFnWithoutBlocking(async () => {
        const response = await queryEngine.query({
          query: message,
          stream: true,
        });
        let content = "";

        for await (const { delta } of response) {
          content += delta;
          ui.update(<ClientMDXContent id={id} content={content} />);
        }

        ui.done();

        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              role: "assistant",
              content,
            },
          ],
        });
      });

      return {
        id,
        display: <BotMessage>{ui.value}</BotMessage>,
      };
    },
  },
});
