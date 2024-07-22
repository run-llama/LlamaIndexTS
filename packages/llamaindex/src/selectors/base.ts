import type { JSONObject } from "@llamaindex/core/global";
import type { QueryType } from "@llamaindex/core/query-engine";
import { PromptMixin } from "../prompts/Mixin.js";
import type { ToolMetadataOnlyDescription } from "../types.js";

export interface SingleSelection extends JSONObject {
  index: number;
  reason: string;
}

export type SelectorResult = {
  selections: SingleSelection[];
};

function wrapChoice(
  choice: string | ToolMetadataOnlyDescription,
): ToolMetadataOnlyDescription {
  if (typeof choice === "string") {
    return { description: choice };
  } else {
    return choice;
  }
}

type MetadataType = string | ToolMetadataOnlyDescription;

export abstract class BaseSelector extends PromptMixin {
  async select(choices: MetadataType[], query: QueryType) {
    const metadata = choices.map((choice) => wrapChoice(choice));
    return await this._select(metadata, query);
  }

  abstract _select(
    choices: ToolMetadataOnlyDescription[],
    query: QueryType,
  ): Promise<SelectorResult>;
}
