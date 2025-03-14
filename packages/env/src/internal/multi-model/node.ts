import { getTransformers, setTransformers, type OnLoad } from "./shared.js";

export {
  setTransformers,
  type LoadTransformerEvent,
  type OnLoad,
} from "./shared.js";

export async function loadTransformers(onLoad: OnLoad) {
  const nodeVersions = process.versions.node.split(".");
  if (nodeVersions[0] && parseInt(nodeVersions[0], 10) < 20) {
    throw new Error(
      "@huggingface/transformers is not supported on Node.js versions below 20",
    );
  }

  if (getTransformers() === null) {
    setTransformers(await import("@huggingface/transformers"));
  } else {
    return getTransformers()!;
  }
  const transformer = getTransformers()!;

  onLoad(transformer);

  return transformer;
}
