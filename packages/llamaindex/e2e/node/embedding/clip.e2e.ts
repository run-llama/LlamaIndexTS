import { ClipEmbedding, ImageNode } from "llamaindex";
import assert from "node:assert";
import { test } from "node:test";

await test("clip embedding", async (t) => {
  await t.test("init & get image embedding", async () => {
    const clipEmbedding = new ClipEmbedding();
    const imgUrl = new URL(
      "../../fixtures/img/llamaindex-white.png",
      import.meta.url,
    );
    const vec = await clipEmbedding.getImageEmbedding(imgUrl);
    assert.ok(vec);
  });

  await t.test("load image document", async () => {
    const nodes = [
      new ImageNode({
        image: new URL(
          "../../fixtures/img/llamaindex-white.png",
          import.meta.url,
        ),
      }),
    ];
    const clipEmbedding = new ClipEmbedding();
    const result = await clipEmbedding(nodes);
    assert.strictEqual(result.length, 1);
    assert.ok(result[0]!.embedding);
  });
});
