import { randomUUID } from "node:crypto";
import { NodeWithScore, TextNode } from "../../Node";
import { ContextSystemPrompt, defaultContextSystemPrompt } from "../../Prompt";
import { BaseRetriever } from "../../Retriever";
import { Event } from "../../callbacks/CallbackManager";
import { BaseNodePostprocessor } from "../../postprocessors";
import { Context, ContextGenerator } from "./types";

export class DefaultContextGenerator implements ContextGenerator {
  retriever: BaseRetriever;
  contextSystemPrompt: ContextSystemPrompt;
  nodePostprocessors: BaseNodePostprocessor[];

  constructor(init: {
    retriever: BaseRetriever;
    contextSystemPrompt?: ContextSystemPrompt;
    nodePostprocessors?: BaseNodePostprocessor[];
  }) {
    this.retriever = init.retriever;
    this.contextSystemPrompt =
      init?.contextSystemPrompt ?? defaultContextSystemPrompt;
    this.nodePostprocessors = init.nodePostprocessors || [];
  }

  private applyNodePostprocessors(nodes: NodeWithScore[]) {
    return this.nodePostprocessors.reduce(
      (nodes, nodePostprocessor) => nodePostprocessor.postprocessNodes(nodes),
      nodes,
    );
  }

  async generate(message: string, parentEvent?: Event): Promise<Context> {
    if (!parentEvent) {
      parentEvent = {
        id: randomUUID(),
        type: "wrapper",
        tags: ["final"],
      };
    }
    const sourceNodesWithScore = await this.retriever.retrieve(
      message,
      parentEvent,
    );

    const nodes = this.applyNodePostprocessors(sourceNodesWithScore);

    return {
      message: {
        content: this.contextSystemPrompt({
          context: nodes.map((r) => (r.node as TextNode).text).join("\n\n"),
        }),
        role: "system",
      },
      nodes,
    };
  }
}
