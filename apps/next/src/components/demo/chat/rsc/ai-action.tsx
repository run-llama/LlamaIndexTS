import { Markdown } from "@llamaindex/chat-ui/widgets";
import { generateId, Message, parseStreamPart } from "ai";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { simulateReadableStream } from "ai/test";
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
      "use server";

      const aiState = getMutableAIState<typeof AI>();
      aiState.update((prev) => [...prev, message]);

      const mockResponse = `Hello! This is a mock response to: ${message.content}`;
      const responseStream = simulateReadableStream({
        chunkDelayInMs: 20,
        values: mockResponse.split(" ").map((t) => `0:"${t} "\n`),
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
            assistantMessage.content += parseStreamPart(message).value;
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
