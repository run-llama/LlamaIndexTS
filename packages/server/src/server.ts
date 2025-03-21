import { createServer } from "http";
import next from "next";
import path from "path";
import { parse } from "url";
import { handleChat } from "./handlers/chat";
import type { LlamaIndexServerOptions, ServerWorkflow } from "./types";

export class LlamaIndexServer {
  port: number;
  app: ReturnType<typeof next>;
  workflowFactory: () => Promise<ServerWorkflow> | ServerWorkflow;

  constructor({ workflow, ...nextAppOptions }: LlamaIndexServerOptions) {
    const nextDir = path.join(__dirname, "./next");
    const dev = process.env.NODE_ENV !== "production";
    this.app = next({ ...nextAppOptions, dev, dir: nextDir });
    this.port = nextAppOptions.port ?? 3000;
    this.workflowFactory = workflow;
  }

  async start() {
    await this.app.prepare();

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      const pathname = parsedUrl.pathname;

      if (pathname === "/api/chat" && req.method === "POST") {
        return handleChat(this.workflowFactory, req, res);
      }

      const handle = this.app.getRequestHandler();
      handle(req, res, parsedUrl);
    });

    server.listen(this.port, () => {
      console.log(`> Server listening at http://localhost:${this.port}`);
    });
  }
}
