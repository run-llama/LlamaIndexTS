import { NodeWithScore, TextNode } from "../../Node";
import { ContextSystemPrompt, defaultContextSystemPrompt } from "../../Prompt";
import { BaseRetriever } from "../../Retriever";
import { Event } from "../../callbacks/CallbackManager";
import { randomUUID } from "../../env";
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

  private async applyNodePostprocessors(nodes: NodeWithScore[], query: string) {
    let nodesWithScore = nodes;

    for (const postprocessor of this.nodePostprocessors) {
      nodesWithScore = await postprocessor.postprocessNodes(
        nodesWithScore,
        query,
      );
    }

    return nodesWithScore;
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

    const nodes = await this.applyNodePostprocessors(
      sourceNodesWithScore,
      message,
    );

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
