import { toQueryBundle } from "../internal/utils.js";
import { PromptMixin } from "../prompts/Mixin.js";
import type {
  MessageContent,
  QueryBundle,
  ToolMetadataOnlyDescription,
} from "../types.js";

export interface SingleSelection {
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
  async select(choices: MetadataType[], query: MessageContent | QueryBundle) {
    const metadata = choices.map((choice) => wrapChoice(choice));
    const queryBundle = toQueryBundle(query);
    return await this._select(metadata, queryBundle);
  }

  abstract _select(
    choices: ToolMetadataOnlyDescription[],
    query: QueryBundle,
  ): Promise<SelectorResult>;
}
