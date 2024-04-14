import { Anthropic } from '../../llm/anthropic.js'
import type {
  ChatEngineParamsNonStreaming,
  ChatEngineParamsStreaming
} from '../../engines/chat/index.js'
import { Settings } from '../../Settings.js'
import { type ChatHistory, SimpleChatHistory } from '../../ChatHistory.js'
import { isAsyncGenerator } from '../../internal/utils.js'
import { pipeline } from '@llamaindex/env'
import type { ChatResponseChunk } from '../../llm/index.js'

export type AnthropicParams = {
  llm?: Anthropic;
  chatHistory?: ChatHistory;
}

async function createChatTask (
  llm: Anthropic,
  chatParams: Parameters<typeof llm.chat>
) {
  const response = await llm.chat(...chatParams)
  if (isAsyncGenerator(response)) {
    await pipeline(response as AsyncIterable<ChatResponseChunk>, async iter => {
      for await (const chunk of iter) {
        chunk.raw
      }
    })
  }
}

export class AnthropicAgent {
  #llm: Anthropic
  #chatHistory: ChatHistory

  constructor (params: AnthropicParams) {
    this.#llm = params.llm ?? Settings.llm instanceof Anthropic
      ? Settings.llm as Anthropic
      : new Anthropic()
    this.#chatHistory = params.chatHistory ?? new SimpleChatHistory()
  }

  chat (params: ChatEngineParamsStreaming): Promise<AsyncIterable<Response>>
  chat (params: ChatEngineParamsNonStreaming): Promise<Response>
  chat (
    params: ChatEngineParamsStreaming | ChatEngineParamsNonStreaming
  ): Promise<AsyncIterable<Response>> | Promise<Response> {
    return createChatTask(this.#llm, [params])
  }
}