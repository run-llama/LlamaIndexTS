import { randomUUID } from "@llamaindex/env";
import { Settings } from "../global";
import type { MessageContent } from "../llms";
import { PromptMixin } from "../prompts";
import type { QueryBundle, QueryType } from "../query-engine";
import { BaseNode, IndexNode, type NodeWithScore, ObjectType } from "../schema";

export type RetrieveParams = {
  query: MessageContent;
  preFilters?: unknown;
};

export type RetrieveStartEvent = {
  id: string;
  query: QueryBundle;
};

export type RetrieveEndEvent = {
  id: string;
  query: QueryBundle;
  nodes: NodeWithScore[];
};

export abstract class BaseRetriever extends PromptMixin {
  objectMap: Map<string, unknown> = new Map();

  protected _updatePrompts() {}
  protected _getPrompts() {
    return {};
  }

  protected _getPromptModules() {
    return {};
  }

  protected constructor() {
    super();
  }

  public async retrieve(params: QueryType): Promise<NodeWithScore[]> {
    const cb = Settings.callbackManager;
    const queryBundle = typeof params === "string" ? { query: params } : params;
    const id = randomUUID();
    cb.dispatchEvent("retrieve-start", { id, query: queryBundle });
    let response = await this._retrieve(queryBundle);
    response = await this._handleRecursiveRetrieval(queryBundle, response);
    cb.dispatchEvent("retrieve-end", {
      id,
      query: queryBundle,
      nodes: response,
    });
    return response;
  }

  abstract _retrieve(params: QueryBundle): Promise<NodeWithScore[]>;

  async _handleRecursiveRetrieval(
    params: QueryBundle,
    nodes: NodeWithScore[],
  ): Promise<NodeWithScore[]> {
    const retrievedNodes = [];
    for (const { node, score = 1.0 } of nodes) {
      if (node.type === ObjectType.INDEX) {
        const indexNode = node as IndexNode;
        const object = this.objectMap.get(indexNode.indexId);
        if (object !== undefined) {
          retrievedNodes.push(
            ...this._retrieveFromObject(object, params, score),
          );
        } else {
          retrievedNodes.push({ node, score });
        }
      } else {
        retrievedNodes.push({ node, score });
      }
    }
    return nodes;
  }

  _retrieveFromObject(
    object: unknown,
    queryBundle: QueryBundle,
    score: number,
  ): NodeWithScore[] {
    if (object == null) {
      throw new TypeError("Object is not retrievable");
    }
    if (typeof object !== "object") {
      throw new TypeError("Object is not retrievable");
    }
    if ("node" in object && object.node instanceof BaseNode) {
      return [
        {
          node: object.node,
          score:
            "score" in object && typeof object.score === "number"
              ? object.score
              : score,
        },
      ];
    }
    if (object instanceof BaseNode) {
      return [{ node: object, score }];
    } else {
      // todo: support other types
      // BaseQueryEngine
      // BaseRetriever
      // QueryComponent
      throw new TypeError("Object is not retrievable");
    }
  }
}
