import type { Message } from "ai";
import express from "express";
import type { ChatMessage } from "llamaindex";
import { getUserMessageContent, pipeExpressResponse } from "./helper";
import { chatWithWorkflow } from "./workflow/stream";
import type { ServerWorkflow } from "./workflow/type";

export interface LlamaIndexServerParams {
  workflow: ServerWorkflow;
  port?: number;
  callbacks?: {
    beforeChat?: (messages: ChatMessage[]) => void;
  };
}

export class LlamaIndexServer {
  app: express.Application;
  workflow: ServerWorkflow;
  port: number;
  callbacks?: LlamaIndexServerParams["callbacks"];

  constructor({ workflow, port = 3000 }: LlamaIndexServerParams) {
    this.app = express();
    this.workflow = workflow;
    this.port = port;
    this.setupRoutes();
  }

  public chatController = async (
    req: express.Request,
    res: express.Response,
  ) => {
    try {
      const { messages } = req.body as { messages: Message[] };
      const userMessageContent = getUserMessageContent(messages);
      this.callbacks?.beforeChat?.(messages as ChatMessage[]);
      const streamResponse = await chatWithWorkflow(
        userMessageContent,
        this.workflow,
      );
      await pipeExpressResponse(res, streamResponse);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  protected setupRoutes() {
    this.app.use(express.json());
    this.app.post("/api/chat", this.chatController);
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`LlamaIndex server running on port ${this.port}`);
    });
  }
}
