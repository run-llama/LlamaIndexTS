import { getTransformers, setTransformers, type OnLoad } from "./shared.js";

export {
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./shared.js";

export async function loadTransformers(onLoad: OnLoad) {
  if (getTransformers() === null) {
    setTransformers(await import("@xenova/transformers"));
  } else {
    return getTransformers()!;
  }
  const transformer = getTransformers()!;

  onLoad(transformer);

  return transformer;
}
