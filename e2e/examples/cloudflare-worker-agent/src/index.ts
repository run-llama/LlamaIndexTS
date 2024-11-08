// add `OPENAI_API_KEY` to the `.dev.vars` file
interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const { setEnvs } = await import("@llamaindex/env");
    setEnvs(env);
    const { OpenAIAgent, OpenAI } = await import("@llamaindex/openai");
    const text = await request.text();
    const agent = new OpenAIAgent({
      llm: new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      }),
      tools: [],
    });
    const responseStream = await agent.chat({
      stream: true,
      message: text,
    });
    const textEncoder = new TextEncoder();
    const response = responseStream.pipeThrough<Uint8Array>(
      new TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(textEncoder.encode(chunk.delta));
        },
      }),
    );
    return new Response("Hello, world!");
  },
};
