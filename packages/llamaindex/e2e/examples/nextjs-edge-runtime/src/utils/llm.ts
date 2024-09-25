// test runtime
import "llamaindex";
import { ClipEmbedding } from "llamaindex";

// @ts-expect-error
if (typeof EdgeRuntime !== "string") {
  throw new Error("Expected run in EdgeRuntime");
}

export const tokenizerResultPromise = new Promise<number[]>(
  (resolve, reject) => {
    const embedding = new ClipEmbedding();
    //#region make sure @xenova/transformers is working in edge runtime
    embedding
      .getTokenizer()
      .then((tokenizer) => {
        resolve(tokenizer.encode("hello world"));
      })
      .catch(reject);
    //#endregion
  },
);
