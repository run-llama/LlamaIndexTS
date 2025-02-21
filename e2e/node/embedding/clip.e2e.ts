import { ClipEmbedding } from "@llamaindex/clip";
import type { LoadTransformerEvent } from "@llamaindex/env/multi-model";
import { setTransformers } from "@llamaindex/env/multi-model";
import { ImageNode, Settings } from "llamaindex";
import assert from "node:assert";
import { type Mock, test } from "node:test";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let callback: Mock<(event: any) => void>;
test.before(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback = test.mock.fn((event: any) => {
    const { transformer } = event.detail as LoadTransformerEvent;
    assert.ok(transformer);
    assert.ok(transformer.env);
  });
  Settings.callbackManager.on("load-transformers", callback);
});

test.beforeEach(() => {
  callback.mock.resetCalls();
});

await test("clip embedding", async (t) => {
  const major = parseInt(process.versions.node.split(".")[0] ?? "0", 10);
  if (major < 20) {
    t.skip("Skip CLIP tests on Node.js < 20");
    return;
  }
  await t.test("should trigger load transformer event", async () => {
    const nodes = [
      new ImageNode({
        image: new URL(
          "../../fixtures/img/llamaindex-white.png",
          import.meta.url,
        ),
      }),
    ];
    assert.equal(callback.mock.callCount(), 0);
    const clipEmbedding = new ClipEmbedding();
    assert.equal(callback.mock.callCount(), 0);
    const result = await clipEmbedding(nodes);
    assert.strictEqual(result.length, 1);
    assert.equal(callback.mock.callCount(), 1);
  });

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

  await t.test("custom transformer", async () => {
    const transformers = await import("@huggingface/transformers");
    const getter = test.mock.fn((t, k, r) => {
      return Reflect.get(t, k, r);
    });
    setTransformers(
      new Proxy(transformers, {
        get: getter,
      }),
    );
    const clipEmbedding = new ClipEmbedding();
    const imgUrl = new URL(
      "../../fixtures/img/llamaindex-white.png",
      import.meta.url,
    );
    assert.equal(getter.mock.callCount(), 0);
    const vec = await clipEmbedding.getImageEmbedding(imgUrl);
    assert.ok(vec);
    assert.ok(getter.mock.callCount() > 0);
  });
});
