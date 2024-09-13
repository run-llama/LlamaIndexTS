"use server";
import { OpenAIAgent } from "llamaindex";
// import your tools on top, that's it
import { runWithStreamableUI } from "@/context";
import "@/tool";
import { convertTools } from "@llamaindex/autotool";
import { createStreamableUI } from "ai/rsc";
import type { ReactNode } from "react";

export async function chatWithAI(message: string): Promise<ReactNode> {
  const agent = new OpenAIAgent({
    tools: convertTools("llamaindex"),
  });
  const uiStream = createStreamableUI();
  runWithStreamableUI(uiStream, () =>
    agent
      .chat({
        stream: true,
        message,
      })
      .then(async (responseStream) => {
        return responseStream.pipeTo(
          new WritableStream({
            start: () => {
              uiStream.append("\n");
            },
            write: async (message) => {
              uiStream.append(message.response);
            },
            close: () => {
              uiStream.done();
            },
          }),
        );
      }),
  ).catch(uiStream.error);
  return uiStream.value;
}
