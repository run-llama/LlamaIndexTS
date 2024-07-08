import { CallbackManager, Settings } from "@llamaindex/core/global";
import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";

declare module "@llamaindex/core/global" {
  interface LlamaIndexEventMaps {
    test: {
      value: number;
    };
  }
}

describe("event system", () => {
  beforeEach(() => {
    Settings.callbackManager = new CallbackManager();
  });

  test("type system", () => {
    Settings.callbackManager.on("test", (event) => {
      const data = event.detail;
      expectTypeOf(data).not.toBeAny();
      expectTypeOf(data).toEqualTypeOf<{
        value: number;
      }>();
    });
  });

  test("dispatch event", async () => {
    let callback;
    Settings.callbackManager.on(
      "test",
      (callback = vi.fn((event) => {
        const data = event.detail;
        expect(data.value).toBe(42);
      })),
    );

    Settings.callbackManager.dispatchEvent("test", {
      value: 42,
    });
    expect(callback).toHaveBeenCalledTimes(0);
    await new Promise((resolve) => process.nextTick(resolve));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  // rollup doesn't support decorators for now
  // test('wrap event caller', async () => {
  //   class A {
  //     @wrapEventCaller
  //     fn() {
  //       Settings.callbackManager.dispatchEvent('test', {
  //         value: 42
  //       });
  //     }
  //   }
  //   const a = new A();
  //   let callback;
  //   Settings.callbackManager.on('test', callback = vi.fn((event) => {
  //     const data = event.detail;
  //     expect(event.reason!.caller).toBe(a);
  //     expect(data.value).toBe(42);
  //   }));
  //   a.fn();
  //   expect(callback).toHaveBeenCalledTimes(0);
  //   await new Promise((resolve) => process.nextTick(resolve));
  //   expect(callback).toHaveBeenCalledTimes(1);
  // })
});
