import { ClientMDXContent } from "@/components/mdx";
import { BotMessage } from "@/components/message";
import { Skeleton } from "@/components/ui/skeleton";
import { ContextChatEngine } from "@llamaindex/core/chat-engine";
import { Settings } from "@llamaindex/core/global";
import { ChatMessage } from "@llamaindex/core/llms";
import { OpenAI } from "@llamaindex/openai";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { LlamaCloudRetriever } from "llama-cloud-services";
import { ReactNode } from "react";

Settings.llm = new OpenAI({
  model: "gpt-4o",
});

const retriever = new LlamaCloudRetriever({
  apiKey: process.env.LLAMA_CLOUD_API_KEY!,
  baseUrl: "https://api.cloud.llamaindex.ai/",
  // @ts-expect-error - FIX THIS: pipelineId is not available (use latest llama-cloud-services@0.3.5)
  pipelineId: process.env.LLAMA_CLOUD_PIPELINE_ID!,
});

const initialAIState = {
  messages: [],
} as {
  messages: ChatMessage[];
};

export type UIMessage = {
  id: number;
  display: ReactNode;
};

const initialUIState = {
  messages: [],
} as {
  messages: UIMessage[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const chatEngine = new ContextChatEngine({ retriever });

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
        const response = await chatEngine.chat({
          message,
          chatHistory: aiState.get().messages,
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
