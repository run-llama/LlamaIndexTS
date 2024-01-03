import { Ollama } from "llamaindex";

(async () => {
  const llm = new Ollama({ model: "llama2", temperature: 0.75 });
  {
    const response = await llm.chat([
      { content: "Tell me a joke.", role: "user" },
    ]);
    console.log("Response 1:", response.message.content);
  }
  {
    const response = await llm.complete("How are you?");
    console.log("Response 2:", response.message.content);
  }
  {
    const response = await llm.chat(
      [{ content: "Tell me a joke.", role: "user" }],
      undefined,
      true,
    );
    console.log("Response 3:");
    for await (const message of response) {
      process.stdout.write(message); // no newline
    }
    console.log(); // newline
  }
  {
    const response = await llm.complete("How are you?", undefined, true);
    console.log("Response 4:");
    for await (const message of response) {
      process.stdout.write(message); // no newline
    }
    console.log(); // newline
  }
  {
    const embedding = await llm.getTextEmbedding("Hello world!");
    console.log("Embedding:", embedding);
  }
})();
