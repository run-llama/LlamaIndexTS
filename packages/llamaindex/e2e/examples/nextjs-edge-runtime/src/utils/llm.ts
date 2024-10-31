// test runtime
import "llamaindex";

// @ts-expect-error EdgeRuntime is not defined
if (typeof EdgeRuntime !== "string") {
  throw new Error("Expected run in EdgeRuntime");
}
