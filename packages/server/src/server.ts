import { createServer } from "http";
import next from "next";
import path from "path";
import { parse } from "url";
import { handleChat } from "./handlers/chat";
import type { ServerWorkflow } from "./types";

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

  async start() {
    await this.app.prepare();

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      const pathname = parsedUrl.pathname;

      if (pathname === "/api/chat" && req.method === "POST") {
        return handleChat(this.workflow, req, res);
      }

      const handle = this.app.getRequestHandler();
      handle(req, res, parsedUrl);
    });

    server.listen(this.port, () => {
      console.log(`> Server listening at http://localhost:${this.port}`);
    });
  }
}
