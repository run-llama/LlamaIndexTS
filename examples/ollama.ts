import { Ollama } from 'llamaindex'

(async () => {
  const llm = new Ollama({ model: 'llama2', temperature: 0.75 })
  {
    const response = await llm.chat([
      { content: 'Tell me a joke.', role: 'user' }
    ])
    console.log('Response 1:', response.message.content)
  }
  {
    const response = await llm.complete('How are you?')
    console.log('Response 2:', response.message.content)
  }
})()
