import { OpenAI } from 'openai'
import { OpenAI as OpenAIClass } from '../../llm/open_ai.js'
import { getEnv } from '@llamaindex/env'
import type { Thread } from 'openai/resources/beta/threads/threads'
import type { OpenAIAgentParams } from '../openai.js'
import { Settings } from '../../Settings.js'

export type OpenaiAssistantAgentParams = OpenAIAgentParams & {
  assistantId: string
  threadId?: string
}

export class OpenaiAssistantAgent {
  readonly #assistantId: string
  readonly #threadPromise: Promise<Thread>
  readonly defaultModel: string;

  #client: OpenAI

  constructor (
    params: OpenaiAssistantAgentParams
  ) {
    const { assistantId, llm } = params
    this.#assistantId = assistantId
    if (llm) {
      this.#client = llm.session.openai
      this.defaultModel = llm.model;
    } else {
      // retrieve the client from defaults
      if (Settings.llm instanceof OpenAIClass) {
        this.#client = Settings.llm.session.openai
        this.defaultModel = Settings.llm.model
      } else {
        this.#client = new OpenAI({
          apiKey: getEnv('OPENAI_API_KEY')
        })
        this.defaultModel = 'gpt-4-turbo'
      }
    }
    if (!params.threadId) {
      this.#threadPromise = this.#client.beta.threads.create()
    } else {
      this.#threadPromise = this.#client.beta.threads.retrieve(params.threadId)
    }
  }

  public async run(
    instructions: string | null = null
  ) {
    const thread = await this.#threadPromise
    const threadId = thread.id;

    const stream = this.#client.beta.threads.runs.stream(threadId, {
      assistant_id: this.#assistantId,
      instructions
    })
    const currentRun = stream.currentRun()
    if (!currentRun) {
      throw new TypeError('No current run')
    }
    for await (const streamEvent of stream) {
      // todo: wrap into StepOutput
    }
  }
}