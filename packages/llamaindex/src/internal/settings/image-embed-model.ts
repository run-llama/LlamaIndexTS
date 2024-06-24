export async function getImageEmbedModel() {
  if (globalThis.navigator?.userAgent === "Cloudflare-Workers") {
    return (await import("../../embeddings/CloudflareWorkerEmbedding.js"))
      .CloudflareWorkerMultiModalEmbedding;
  } else {
    return (await import("../../embeddings/ClipEmbedding.js")).ClipEmbedding;
  }
}
