"use server";
// test runtime
import "@llamaindex/edge";

// @ts-expect-error
if (typeof EdgeRuntime !== "string") {
  throw new Error("Expected run in EdgeRuntime");
}
