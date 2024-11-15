import { llm } from "@/lib/utils";
import { Markdown } from "@llamaindex/chat-ui/widgets";
import { generateId, LlamaIndexAdapter, Message, parseStreamPart } from "ai";
import { createAI, createStreamableUI, getMutableAIState } from "ai/rsc";
import { type ChatMessage, Settings, SimpleChatEngine } from "llamaindex";
import { ReactNode } from "react";

type ServerState = Message[];
type FrontendState = Array<Message & { display: ReactNode }>;
type Actions = {
  chat: (message: Message) => Promise<Message & { display: ReactNode }>;
};

Settings.llm = llm;

export const AI = createAI<ServerState, FrontendState, Actions>({
  initialAIState: [],
  initialUIState: [],
  actions: {
    chat: async (message: Message) => {
      "use server";

      const aiState = getMutableAIState<typeof AI>();
      aiState.update((prev) => [...prev, message]);

      const chatEngine = new SimpleChatEngine();
      const dataStream = LlamaIndexAdapter.toDataStream(
        await chatEngine.chat({
          stream: true,
          message: message.content,
          chatHistory: aiState.get() as ChatMessage[],
        }),
      );

      const uiStream = createStreamableUI();
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
      };

      dataStream.pipeThrough(new TextDecoderStream()).pipeTo(
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
