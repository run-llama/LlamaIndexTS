export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const { setEnvs } = await import("@llamaindex/env");
    setEnvs(env);
    const { OpenAIAgent } = await import("llamaindex");
    const agent = new OpenAIAgent({
      tools: [],
    });
    console.log(1);
    const responseStream = await agent.chat({
      stream: true,
      message: "Hello? What is the weather today?",
    });
    console.log(2);
    const textEncoder = new TextEncoder();
    const response = responseStream.pipeThrough<Uint8Array>(
      new TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(textEncoder.encode(chunk.delta));
        },
      }),
    );
    return new Response(response);
  },
};
