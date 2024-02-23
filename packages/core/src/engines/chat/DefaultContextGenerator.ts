import { randomUUID } from "@llamaindex/env";
import { NodeWithScore, TextNode } from "../../Node.js";
import {
  ContextSystemPrompt,
  defaultContextSystemPrompt,
} from "../../Prompt.js";
import { BaseRetriever } from "../../Retriever.js";
import { Event } from "../../callbacks/CallbackManager.js";
import { BaseNodePostprocessor } from "../../postprocessors/index.js";
import { PromptMixin } from "../../prompts/index.js";
import { Context, ContextGenerator } from "./types.js";

export class DefaultContextGenerator
  extends PromptMixin
  implements ContextGenerator
{
  retriever: BaseRetriever;
  contextSystemPrompt: ContextSystemPrompt;
  nodePostprocessors: BaseNodePostprocessor[];

  constructor(init: {
    retriever: BaseRetriever;
    contextSystemPrompt?: ContextSystemPrompt;
    nodePostprocessors?: BaseNodePostprocessor[];
  }) {
    super();

    this.retriever = init.retriever;
    this.contextSystemPrompt =
      init?.contextSystemPrompt ?? defaultContextSystemPrompt;
    this.nodePostprocessors = init.nodePostprocessors || [];
  }

  protected _getPrompts(): { contextSystemPrompt: ContextSystemPrompt } {
    return {
      contextSystemPrompt: this.contextSystemPrompt,
    };
  }

  protected _updatePrompts(promptsDict: {
    contextSystemPrompt: ContextSystemPrompt;
  }): void {
    if (promptsDict.contextSystemPrompt) {
      this.contextSystemPrompt = promptsDict.contextSystemPrompt;
    }
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
