let transformer: typeof import("@xenova/transformers") | null = null;

export function getTransformers() {
  return transformer;
}

export function setTransformers(t: typeof import("@xenova/transformers")) {
  transformer = t;
}

export type OnLoad = (
  transformer: typeof import("@xenova/transformers"),
) => void;

export type LoadTransformerEvent = {
  transformer: typeof import("@xenova/transformers");
};
