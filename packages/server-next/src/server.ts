import { createServer, IncomingMessage, ServerResponse } from "http";
import { type ChatMessage } from "llamaindex";
import next from "next";
import path from "path";
import { parse } from "url";
import {
  chatWithWorkflow,
  parseRequestBody,
  pipeResponse,
} from "./workflow/stream";
import type { ServerWorkflow } from "./workflow/type";

type NextAppOptions = Omit<Parameters<typeof next>[0], "dir">;

export type LlamaIndexServerOptions = NextAppOptions & {
  workflow: ServerWorkflow;
};

export class LlamaIndexServer {
  port: number;
  app: ReturnType<typeof next>;
  workflow: ServerWorkflow;

  constructor({ workflow, ...nextAppOptions }: LlamaIndexServerOptions) {
    const nextDir = path.join(__dirname, ".."); // location of the .next after build next app
    this.app = next({ ...nextAppOptions, dir: nextDir });
    this.port = nextAppOptions.port ?? 3000;
    this.workflow = workflow;
  }

  async handleChat(req: IncomingMessage, res: ServerResponse) {
    try {
      const body = await parseRequestBody(req);
      const { messages } = body as { messages: ChatMessage[] };
      const streamResponse = await chatWithWorkflow(this.workflow, messages);
      pipeResponse(res, streamResponse);
    } catch (error) {
      console.error("Chat error:", error);
      res.end("Internal server error");
    }
  }

  async start() {
    await this.app.prepare();

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      const pathname = parsedUrl.pathname;

      if (pathname === "/api/chat" && req.method === "POST") {
        return this.handleChat(req, res);
      }

      const handle = this.app.getRequestHandler();
      handle(req, res, parsedUrl);
    });

    server.listen(this.port, () => {
      console.log(`> Server listening at http://localhost:${this.port}`);
    });
  }
}
