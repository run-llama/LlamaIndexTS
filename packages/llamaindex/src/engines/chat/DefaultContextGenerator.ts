import { type NodeWithScore } from "@llamaindex/core/schema";
import type { ContextSystemPrompt } from "../../Prompt.js";
import { defaultContextSystemPrompt } from "../../Prompt.js";
import type { BaseRetriever } from "../../Retriever.js";
import type { MessageContent, MessageType } from "../../llm/types.js";
import type { BaseNodePostprocessor } from "../../postprocessors/index.js";
import { PromptMixin } from "../../prompts/index.js";
import { createMessageContent } from "../../synthesizers/utils.js";
import type { Context, ContextGenerator } from "./types.js";

export class DefaultContextGenerator
  extends PromptMixin
  implements ContextGenerator
{
  retriever: BaseRetriever;
  contextSystemPrompt: ContextSystemPrompt;
  nodePostprocessors: BaseNodePostprocessor[];
  contextRole: MessageType;

  constructor(init: {
    retriever: BaseRetriever;
    contextSystemPrompt?: ContextSystemPrompt;
    nodePostprocessors?: BaseNodePostprocessor[];
    contextRole?: MessageType;
  }) {
    super();

    this.retriever = init.retriever;
    this.contextSystemPrompt =
      init?.contextSystemPrompt ?? defaultContextSystemPrompt;
    this.nodePostprocessors = init.nodePostprocessors || [];
    this.contextRole = init.contextRole ?? "system";
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

  private async applyNodePostprocessors(
    nodes: NodeWithScore[],
    query: MessageContent,
  ) {
    let nodesWithScore = nodes;

    for (const postprocessor of this.nodePostprocessors) {
      nodesWithScore = await postprocessor.postprocessNodes(
        nodesWithScore,
        query,
      );
    }

    return nodesWithScore;
  }

  async generate(message: MessageContent): Promise<Context> {
    const sourceNodesWithScore = await this.retriever.retrieve({
      query: message,
    });

    const nodes = await this.applyNodePostprocessors(
      sourceNodesWithScore,
      message,
    );

    const content = await createMessageContent(
      this.contextSystemPrompt,
      nodes.map((r) => r.node),
    );

    return {
      message: {
        content,
        role: this.contextRole,
      },
      nodes,
    };
  }
}
