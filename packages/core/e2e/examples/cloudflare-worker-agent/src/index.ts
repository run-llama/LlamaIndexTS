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
    const responseStream = await agent.chat({
      stream: true,
      message: "Hello? What is the weather today?",
    });
    const textEncoder = new TextEncoder();
    const response = responseStream.pipeThrough<Uint8Array>(
      // @ts-expect-error: see https://github.com/cloudflare/workerd/issues/2067
      new TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(textEncoder.encode(chunk.response.delta));
        },
      }),
    );
    // @ts-expect-error: see https://github.com/cloudflare/workerd/issues/2067
    return new Response(response);
  },
};
