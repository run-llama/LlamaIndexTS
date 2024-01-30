import { QueryBundle, ToolMetadata } from "../types";

export class SingleSelection {
  index!: number;
  reason!: string;
}

export class MultiSelection {
  selections!: SingleSelection[];

  constructor(selections: SingleSelection[]) {
    this.selections = selections;
  }

  get ind(): number {
    if (this.selections.length !== 1) {
      throw new Error(
        `There are ${this.selections.length} selections, please use .inds.`,
      );
    }
    return this.selections[0].index;
  }

  get reasons(): string[] {
    if (this.selections.length !== 1) {
      throw new Error(
        `There are ${this.selections.length} selections, please use .reasons.`,
      );
    }
    return this.selections.map((x) => x.reason);
  }

  get inds(): number[] {
    return this.selections.map((x) => x.index);
  }
}

export type SelectorResult = {
  selections: SingleSelection[];
};

type QueryType = string | QueryBundle;

function wrapChoice(choice: string | ToolMetadata): ToolMetadata {
  if (typeof choice === "string") {
    return { description: choice, name: choice };
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

type MetadataType = string | ToolMetadata;

export abstract class BaseSelector {
  async select(choices: MetadataType[], query: QueryBundle) {
    const metadatas = choices.map((choice) => wrapChoice(choice));
    const queryBundle = wrapQuery(query);
    return await this._select(metadatas, queryBundle);
  }

  abstract _select(
    choices: ToolMetadata[],
    query: QueryBundle,
  ): Promise<SelectorResult>;
  abstract asQueryComponent(): unknown;
}
