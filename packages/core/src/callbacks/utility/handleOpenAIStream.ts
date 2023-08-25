import { ChatCompletionChunk } from "openai/resources/chat";
import { Stream } from "openai/streaming";
import { globalsHelper } from "../../GlobalsHelper";
import { MessageType } from "../../llm/LLM";
import { Event, StreamCallbackResponse } from "../CallbackManager";

/**
 * Handles the OpenAI streaming interface and pipes it to the callback function
 * @param response - The response from the OpenAI API.
 * @param onLLMStream - A callback function to handle the LLM stream.
 * @param parentEvent - An optional parent event.
 * @returns A promise that resolves to an object with a message and a role.
 */
export async function handleOpenAIStream({
  response,
  onLLMStream,
  parentEvent,
}: {
  response: Stream<ChatCompletionChunk>;
  onLLMStream: (data: StreamCallbackResponse) => void;
  parentEvent?: Event;
}): Promise<{ message: string; role: MessageType }> {
  const event = globalsHelper.createEvent({
    parentEvent,
    type: "llmPredict",
  });
  let index = 0;
  let cumulativeText = "";
  let messageRole: MessageType = "assistant";
  for await (const part of response) {
    const { content = "", role = "assistant" } = part.choices[0].delta;

    // ignore the first token
    if (!content && role === "assistant" && index === 0) {
      continue;
    }

    cumulativeText += content;
    messageRole = role;
    onLLMStream?.({ event, index, token: part });
    index++;
  }
  onLLMStream?.({ event, index, isDone: true });
  return { message: cumulativeText, role: messageRole };
}
