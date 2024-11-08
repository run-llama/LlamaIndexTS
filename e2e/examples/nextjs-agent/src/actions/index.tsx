"use server";
import { createStreamableUI } from "ai/rsc";
import type { ChatMessage } from "llamaindex";
import { OpenAIAgent } from "llamaindex";

export async function chatWithAgent(
  question: string,
  prevMessages: ChatMessage[] = [],
) {
  const agent = new OpenAIAgent({
    tools: [],
  });
  const responseStream = await agent.chat({
    stream: true,
    message: question,
    chatHistory: prevMessages,
  });
  const uiStream = createStreamableUI(<div>loading...</div>);
  responseStream
    .pipeTo(
      new WritableStream({
        start: () => {
          uiStream.update("response:");
        },
        write: async (message) => {
          uiStream.append(message.delta);
        },
      }),
    )
    .catch(uiStream.error);
  return uiStream.value;
}
