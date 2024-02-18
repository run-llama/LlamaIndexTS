import { PromptMixin } from "../prompts";
import { QueryBundle, ToolMetadataOnlyDescription } from "../types";

export interface SingleSelection {
  index: number;
  reason: string;
}

export type SelectorResult = {
  selections: SingleSelection[];
};

type QueryType = string | QueryBundle;

function wrapChoice(
  choice: string | ToolMetadataOnlyDescription,
): ToolMetadataOnlyDescription {
  if (typeof choice === "string") {
    return { description: choice };
  } else {
    return choice;
  }
}

function wrapQuery(query: QueryType): QueryBundle {
  if (typeof query === "string") {
    return { queryStr: query };
  }

  return query;
}

type MetadataType = string | ToolMetadataOnlyDescription;

export abstract class BaseSelector extends PromptMixin {
  async select(choices: MetadataType[], query: QueryType) {
    const metadatas = choices.map((choice) => wrapChoice(choice));
    const queryBundle = wrapQuery(query);
    return await this._select(metadatas, queryBundle);
  }

  abstract _select(
    choices: ToolMetadataOnlyDescription[],
    query: QueryBundle,
  ): Promise<SelectorResult>;
}
