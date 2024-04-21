import { OpenaiAssistantAgent } from 'llamaindex/agent/openai'

const assistantId = process.env.ASSISTANT_ID

if (!assistantId) {
  throw new Error('ASSISTANT_ID is required for openai')
}

const agent = new OpenaiAssistantAgent({
  assistantId
})

agent.run('What\'s the weather today?')
