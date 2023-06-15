// GitHub translated

import { DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP } from "./constants";

class TokenTextSplitter {
  private _separator: string;
  private _chunk_size: number;
  private _chunk_overlap: number;
  private tokenizer: any;
  private _backup_separators: string[];
  private callback_manager: any;

  constructor(
    separator: string = " ",
    chunk_size: number = DEFAULT_CHUNK_SIZE,
    chunk_overlap: number = DEFAULT_CHUNK_OVERLAP,
    tokenizer: any = null,
    backup_separators: string[] = ["\n"]
    // callback_manager: any = null
  ) {
    if (chunk_overlap > chunk_size) {
      throw new Error(
        `Got a larger chunk overlap (${chunk_overlap}) than chunk size (${chunk_size}), should be smaller.`
      );
    }
    this._separator = separator;
    this._chunk_size = chunk_size;
    this._chunk_overlap = chunk_overlap;
    this.tokenizer = tokenizer || globals_helper.tokenizer;
    this._backup_separators = backup_separators;
    // this.callback_manager = callback_manager || new CallbackManager([]);
  }

  private _reduceChunkSize(
    start_idx: number,
    cur_idx: number,
    splits: string[]
  ): number {
    let current_doc_total = this.tokenizer(
      splits.slice(start_idx, cur_idx).join(this._separator)
    ).length;
    while (current_doc_total > this._chunk_size) {
      const percent_to_reduce =
        (current_doc_total - this._chunk_size) / current_doc_total;
      const num_to_reduce =
        parseInt(percent_to_reduce.toString()) * (cur_idx - start_idx) + 1;
      cur_idx -= num_to_reduce;
      current_doc_total = this.tokenizer(
        splits.slice(start_idx, cur_idx).join(this._separator)
      ).length;
    }
    return cur_idx;
  }

  _preprocessSplits(splits: Array<string>, chunk_size: number): Array<string> {
    const new_splits: Array<string> = [];
    for (const split of splits) {
      const num_cur_tokens = tokenizer(split).length;
      if (num_cur_tokens <= chunk_size) {
        new_splits.push(split);
      } else {
        let cur_splits: Array<string> = [split];
        if (backup_separators) {
          for (const sep of backup_separators) {
            if (split.includes(sep)) {
              cur_splits = split.split(sep);
              break;
            }
          }
        } else {
          cur_splits = [split];
        }

        const cur_splits2: Array<string> = [];
        for (const cur_split of cur_splits) {
          const num_cur_tokens = tokenizer(cur_split).length;
          if (num_cur_tokens <= chunk_size) {
            cur_splits2.push(cur_split);
          } else {
            // split cur_split according to chunk size of the token numbers
            const cur_split_chunks: Array<string> = [];
            let end_idx = cur_split.length;
            while (tokenizer(cur_split.slice(0, end_idx)).length > chunk_size) {
              for (let i = 1; i < end_idx; i++) {
                const tmp_split = cur_split.slice(0, end_idx - i);
                if (tokenizer(tmp_split).length <= chunk_size) {
                  cur_split_chunks.push(tmp_split);
                  cur_splits2.push(cur_split.slice(end_idx - i, end_idx));
                  end_idx = cur_split.length;
                  break;
                }
              }
            }
            cur_split_chunks.push(cur_split);
            cur_splits2.push(...cur_split_chunks);
          }
        }
        new_splits.push(...cur_splits2);
      }
    }
    return new_splits;
  }

  _postprocessSplits(docs: TextSplit[]): TextSplit[] {
    const new_docs: TextSplit[] = [];
    for (const doc of docs) {
      if (doc.text_chunk.replace(" ", "") == "") {
        continue;
      }
      new_docs.push(doc);
    }
    return new_docs;
  }

  splitText(text: string, extra_info_str?: string): string[] {
    const text_splits = this.splitTextWithOverlaps(text);
    const chunks = text_splits.map((text_split) => text_split.text_chunk);
    return chunks;
  }

  splitTextWithOverlaps(text: string) {}

  truncateText(text: string, separator: string, chunk_size: number): string {
    if (text == "") {
      return "";
    }
    // First we naively split the large input into a bunch of smaller ones.
    let splits: string[] = text.split(separator);
    splits = preprocessSplits(splits, chunk_size);

    let start_idx = 0;
    let cur_idx = 0;
    let cur_total = 0;
    while (cur_idx < splits.length) {
      let cur_token = splits[cur_idx];
      let num_cur_tokens = Math.max(tokenizer(cur_token).length, 1);
      if (cur_total + num_cur_tokens > chunk_size) {
        cur_idx = reduce_chunk_size(start_idx, cur_idx, splits);
        break;
      }
      cur_total += num_cur_tokens;
      cur_idx += 1;
    }
    return splits.slice(start_idx, cur_idx).join(separator);
  }
}
