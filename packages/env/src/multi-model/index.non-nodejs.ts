import { getTransformers, type OnLoad } from "./shared.js";
export {
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./shared.js";
export async function loadTransformers(onLoad: OnLoad) {
  if (getTransformers() === null) {
    /**
     * If you see this warning, it means that the current environment does not support the transformer.
     *  because "@xeonva/transformers" highly depends on Node.js APIs.
     *
     * One possible solution is to fix their implementation to make it work in the non-Node.js environment,
     *  but it's not worth the effort because Edge Runtime and Cloudflare Workers are not the for heavy Machine Learning task.
     *
     * Or you can provide an RPC server that runs the transformer in a Node.js environment.
     * Or you just run the code in a Node.js environment.
     *
     * Refs: https://github.com/xenova/transformers.js/issues/309
     */
    console.warn('"@xenova/transformers" is not supported in this environment');
    console.warn(
      "Please provide a custom implementation of the transformer, or use different alternatives",
    );
  } else {
    return getTransformers()!;
  }
  const transformer = getTransformers()!;
  onLoad(transformer);
  return transformer;
}
