import { ChatCompletionChunk } from "openai/resources/chat";
import { globalsHelper } from "../../GlobalsHelper";
import { StreamCallbackResponse, Event } from "../CallbackManager";
import { APIResponse } from "openai/core";
import { Stream } from "openai/streaming";

export async function handleOpenAIStream({
  response,
  onLLMStream,
  parentEvent,
}: {
  response: APIResponse<Stream<ChatCompletionChunk>>;
  onLLMStream: (data: StreamCallbackResponse) => void;
  parentEvent?: Event;
}): Promise<string> {
  const event = globalsHelper.createEvent({
    parentEvent,
    type: "llmPredict",
  });
  let index = 0;
  let cumulativeText = "";
  for await (const part of response) {
    const { content = "", role = "assistant" } = part.choices[0].delta;

    // ignore the first token
    if (!content && role === "assistant" && index === 0) {
      continue;
    }

    cumulativeText += content;
    onLLMStream?.({ event, index, token: part });
    index++;
  }
  onLLMStream?.({ event, index, isDone: true });
  return cumulativeText;
}
