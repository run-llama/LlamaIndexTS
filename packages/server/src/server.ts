import fs from "fs";
import { createServer } from "http";
import next from "next";
import path from "path";
import { parse } from "url";
import { handleChat } from "./handlers/chat";
import { handleServeFiles } from "./handlers/files";
import type { LlamaIndexServerOptions, ServerWorkflow } from "./types";

const nextDir = path.join(__dirname, "../server");
const configFile = path.join(__dirname, "../server/public/config.js");
const dev = process.env.NODE_ENV !== "production";

export class LlamaIndexServer {
  port: number;
  app: ReturnType<typeof next>;
  workflowFactory: () => Promise<ServerWorkflow> | ServerWorkflow;

  constructor({ workflow, ...nextAppOptions }: LlamaIndexServerOptions) {
    this.app = next({ dev, dir: nextDir, ...nextAppOptions });
    this.port = nextAppOptions.port ?? 3000;
    this.workflowFactory = workflow;

    this.modifyConfig(nextAppOptions);
  }

  private modifyConfig(
    options: Pick<LlamaIndexServerOptions, "starterQuestions">,
  ) {
    // content in javascript format
    const content = `
      window.LLAMAINDEX = {
        CHAT_API: '/api/chat',
        STARTER_QUESTIONS: ${JSON.stringify(options.starterQuestions ?? [])}
      }
    `;
    fs.writeFileSync(configFile, content);
  }

  async start() {
    await this.app.prepare();

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      const pathname = parsedUrl.pathname;

      if (pathname === "/api/chat" && req.method === "POST") {
        return handleChat(this.workflowFactory, req, res);
      }

      if (pathname?.startsWith("/api/files") && req.method === "GET") {
        return handleServeFiles(req, res, pathname);
      }

      const handle = this.app.getRequestHandler();
      handle(req, res, parsedUrl);
    });

    server.listen(this.port, () => {
      console.log(`> Server listening at http://localhost:${this.port}`);
    });
  }
}
