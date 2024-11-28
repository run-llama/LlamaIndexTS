let transformer: typeof import("@huggingface/transformers") | null = null;

export function getTransformers() {
  return transformer;
}

export function setTransformers(t: typeof import("@huggingface/transformers")) {
  transformer = t;
}

export type OnLoad = (
  transformer: typeof import("@huggingface/transformers"),
) => void;

export type LoadTransformerEvent = {
  transformer: typeof import("@huggingface/transformers");
};
