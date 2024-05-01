"use server";
// test runtime
import "llamaindex";
import "llamaindex/readers/SimpleDirectoryReader";

// @ts-expect-error
if (typeof EdgeRuntime !== "string") {
  throw new Error("Expected run in EdgeRuntime");
}
