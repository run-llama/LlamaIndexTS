import { randomUUID } from "@llamaindex/env";

/**
 * The underlying structure of each index.
 */
export abstract class IndexStruct {
  indexId: string;
  summary?: string | undefined;

  constructor(indexId = randomUUID(), summary: string | undefined = undefined) {
    this.indexId = indexId;
    this.summary = summary;
  }

  toJson(): Record<string, unknown> {
    return {
      indexId: this.indexId,
      summary: this.summary,
    };
  }

  getSummary(): string {
    if (this.summary === undefined) {
      throw new Error("summary field of the index dict is not set");
    }
    return this.summary;
  }
}
