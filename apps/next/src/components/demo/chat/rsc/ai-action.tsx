import { Markdown } from "@llamaindex/chat-ui/widgets";
import { MockLLM } from "@llamaindex/core/utils";
import { generateId, Message } from "ai";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { type ChatMessage, Settings, SimpleChatEngine } from "llamaindex";
import { ReactNode } from "react";

type ServerState = Message[];
type FrontendState = Array<Message & { display: ReactNode }>;
type Actions = {
  chat: (message: Message) => Promise<Message & { display: ReactNode }>;
};

Settings.llm = new MockLLM(); // config your LLM here

export const AI = createAI<ServerState, FrontendState, Actions>({
  initialAIState: [],
  initialUIState: [],
  actions: {
    chat: async (message: Message) => {
      "use server";

      const aiState = getMutableAIState<typeof AI>();
      aiState.update((prev) => [...prev, message]);

      const uiStream = createStreamableUI();
      const chatEngine = new SimpleChatEngine();
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
      };

      // run the async function without blocking
      (async () => {
        const chatResponse = await chatEngine.chat({
          stream: true,
          message: message.content,
          chatHistory: aiState.get() as ChatMessage[],
        });

        for await (const chunk of chatResponse) {
          assistantMessage.content += chunk.delta;
          uiStream.update(<Markdown content={assistantMessage.content} />);
        }

        aiState.done([...aiState.get(), assistantMessage]);
        uiStream.done();
      })();

      return {
        ...assistantMessage,
        display: uiStream.value,
      };
    },
  },
});
