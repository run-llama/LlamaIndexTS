/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

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
    const response = responseStream.pipeThrough(
      new TransformStream({
        transform: (chunk, controller) => {
          controller.enqueue(textEncoder.encode(chunk.response.delta));
        },
      }),
    );
    return new Response(response);
  },
};
