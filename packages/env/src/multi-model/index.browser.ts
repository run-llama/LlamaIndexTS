import { getTransformers, setTransformers, type OnLoad } from "./shared.js";

export {
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./shared.js";
export async function loadTransformers(onLoad: OnLoad) {
  if (getTransformers() === null) {
    setTransformers(
      // @ts-expect-error
      await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2"),
    );
  } else {
    return getTransformers()!;
  }
  const transformer = getTransformers()!;
  onLoad(transformer);
  return transformer;
}
