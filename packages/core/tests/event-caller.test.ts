import { Settings } from "@llamaindex/core/global";
import { describe, expectTypeOf, test } from "vitest";

declare module "@llamaindex/core/global" {
  interface LlamaIndexEventMaps {
    test: {
      value: number;
    };
  }
}

describe("event caller", () => {
  test("type system", () => {
    Settings.callbackManager.on("test", (event) => {
      const data = event.detail;
      expectTypeOf(data).not.toBeAny();
      expectTypeOf(data).toEqualTypeOf<{
        value: number;
      }>();
    });
  });
});
