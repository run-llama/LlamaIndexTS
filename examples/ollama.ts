import { Ollama } from 'llamaindex';

(async () => {
  const llm = new Ollama({ model: 'llama2', temperature: 0.75 });
  // chat api
  const generator = await llm.chat([
    { content: 'Tell me a joke.', role: 'user' },
    ], null, true);
  for await (const message of generator) {
    console.log(message)
  }
})()
