import { Markdown } from "@llamaindex/chat-ui/widgets";
import { generateId, Message } from "ai";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { ChatMessage, OpenAIAgent } from "llamaindex";
import { ReactNode } from "react";

type ServerState = Message[];
type FrontendState = Array<Message & { display: ReactNode }>;
type Actions = {
  chat: (message: Message) => Promise<Message & { display: ReactNode }>;
};

export const AI = createAI<ServerState, FrontendState, Actions>({
  initialAIState: [],
  initialUIState: [],
  actions: {
    chat: async (message: Message) => {
      const aiState = getMutableAIState<AIProvider>();
      aiState.update((prev) => [...prev, message]);

      const agent = new OpenAIAgent({ tools: [] });
      const responseStream = await agent.chat({
        stream: true,
        message: message.content,
        chatHistory: aiState.get() as ChatMessage[],
      });

      const uiStream = createStreamableUI();
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
      };

      responseStream.pipeTo(
        new WritableStream({
          write: async (message) => {
            assistantMessage.content += message.delta;
            uiStream.update(<Markdown content={assistantMessage.content} />);
          },
          close: () => {
            aiState.done([...aiState.get(), assistantMessage]);
            uiStream.done();
          },
        }),
      );

      return {
        ...assistantMessage,
        display: uiStream.value,
      };
    },
  },
});

export type AIProvider = typeof AI;
