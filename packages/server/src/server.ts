import { getEnv } from "@llamaindex/env";
import fs from "fs";
import { createServer } from "http";
import next from "next";
import path from "path";
import { parse } from "url";
import { promisify } from "util";
import { handleChat } from "./handlers/chat";
import { getLlamaCloudConfig } from "./handlers/cloud";
import { getComponents } from "./handlers/components";
import { handleServeFiles } from "./handlers/files";
import type { LlamaIndexServerOptions, ServerWorkflow } from "./types";

const nextDir = path.join(__dirname, "..", "server");
const configFile = path.join(__dirname, "..", "server", "public", "config.js");
const dev = process.env.NODE_ENV !== "production";

export class LlamaIndexServer {
  port: number;
  app: ReturnType<typeof next>;
  workflowFactory: () => Promise<ServerWorkflow> | ServerWorkflow;
  componentsDir?: string | undefined;

  constructor(options: LlamaIndexServerOptions) {
    const { workflow, ...nextAppOptions } = options;
    this.app = next({ dev, dir: nextDir, ...nextAppOptions });
    this.port = nextAppOptions.port ?? parseInt(process.env.PORT || "3000", 10);
    this.workflowFactory = workflow;
    this.componentsDir = options.componentsDir;

    if (this.componentsDir) {
      this.createComponentsDir(this.componentsDir);
    }

    this.modifyConfig(options);
  }

  private modifyConfig(options: LlamaIndexServerOptions) {
    const appTitle = options.appTitle ?? "LlamaIndex App";
    const starterQuestions = options.starterQuestions ?? [];
    const llamaCloudApi = getEnv("LLAMA_CLOUD_API_KEY")
      ? "/api/chat/config/llamacloud"
      : undefined;
    const componentsApi = this.componentsDir ? "/api/components" : undefined;

    // content in javascript format
    const content = `
      window.LLAMAINDEX = {
        CHAT_API: '/api/chat',
        APP_TITLE: ${JSON.stringify(appTitle)},
        LLAMA_CLOUD_API: ${JSON.stringify(llamaCloudApi)},
        STARTER_QUESTIONS: ${JSON.stringify(starterQuestions)},
        COMPONENTS_API: ${JSON.stringify(componentsApi)}
      }
    `;
    fs.writeFileSync(configFile, content);
  }

  private async createComponentsDir(componentsDir: string) {
    const exists = await promisify(fs.exists)(componentsDir);
    if (!exists) {
      await promisify(fs.mkdir)(componentsDir);
    }
  }

  async start() {
    await this.app.prepare();

    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      const pathname = parsedUrl.pathname;

      if (pathname === "/api/chat" && req.method === "POST") {
        return handleChat(req, res, this.workflowFactory);
      }

      if (pathname?.startsWith("/api/files") && req.method === "GET") {
        return handleServeFiles(req, res, pathname);
      }

      if (
        this.componentsDir &&
        pathname === "/api/components" &&
        req.method === "GET"
      ) {
        return getComponents(req, res, this.componentsDir);
      }

      if (
        getEnv("LLAMA_CLOUD_API_KEY") &&
        pathname === "/api/chat/config/llamacloud" &&
        req.method === "GET"
      ) {
        return getLlamaCloudConfig(req, res);
      }

      const handle = this.app.getRequestHandler();
      handle(req, res, parsedUrl);
    });

    server.listen(this.port, () => {
      console.log(`> Server listening at http://localhost:${this.port}`);
    });
  }
}
