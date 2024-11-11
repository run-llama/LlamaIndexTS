import { getTransformers, setTransformers, type OnLoad } from "./shared.js";

export {
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./shared.js";
export async function loadTransformers(onLoad: OnLoad) {
  if (getTransformers() === null) {
    setTransformers(
      await import(
        // @ts-expect-error no type
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2"
      ),
    );
  } else {
    return getTransformers()!;
  }
  const transformer = getTransformers()!;
  onLoad(transformer);
  return transformer;
}
