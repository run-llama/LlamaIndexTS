import { globalsHelper } from "../../GlobalsHelper";
import { StreamCallbackResponse, Event } from "../CallbackManager";
import { StreamToken } from "../CallbackManager";

export async function aHandleOpenAIStream({
  response,
  onLLMStream,
  parentEvent,
}: {
  response: any;
  onLLMStream: (data: StreamCallbackResponse) => void;
  parentEvent?: Event;
}): Promise<string> {
  const event = globalsHelper.createEvent({
    parentEvent,
    type: "llmPredict",
  });
  const stream = __astreamCompletion(response.data as any);
  let index = 0;
  let cumulativeText = "";
  for await (const message of stream) {
    const token: StreamToken = JSON.parse(message);
    const { content = "", role = "assistant" } = token?.choices[0]?.delta ?? {};
    // ignore the first token
    if (!content && role === "assistant" && index === 0) {
      continue;
    }
    cumulativeText += content;
    onLLMStream?.({ event, index, token });
    index++;
  }
  onLLMStream?.({ event, index, isDone: true });
  return cumulativeText;
}

/*
  sources:
  - https://github.com/openai/openai-node/issues/18#issuecomment-1372047643
  - https://github.com/openai/openai-node/issues/18#issuecomment-1595805163
*/
async function* __astreamCompletion(data: string[]) {
  yield* __alinesToText(__achunksToLines(data));
}

async function* __alinesToText(linesAsync: string | void | any) {
  for await (const line of linesAsync) {
    yield line.substring("data :".length);
  }
}

async function* __achunksToLines(chunksAsync: string[]) {
  let previous = "";
  for await (const chunk of chunksAsync) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    previous += bufferChunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf("\n")) >= 0) {
      const line = previous.slice(0, eolIndex + 1).trimEnd();
      if (line === "data: [DONE]") break;
      if (line.startsWith("data: ")) yield line;
      previous = previous.slice(eolIndex + 1);
    }
  }
}
