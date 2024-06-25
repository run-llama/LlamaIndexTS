let transformer: typeof import("@xenova/transformers") | null = null;

export async function lazyLoadTransformers() {
  if (!transformer) {
    transformer = await import("@xenova/transformers");
  }

  // @ts-expect-error
  if (typeof EdgeRuntime === "string") {
    // there is no local file system in the edge runtime
    transformer.env.allowLocalModels = false;
  }
  // fixme: handle cloudflare workers case here?
  return transformer;
}
