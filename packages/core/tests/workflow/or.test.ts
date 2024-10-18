import { WorkflowEvent } from "@llamaindex/core/workflow";

import { expect, test } from "vitest";

test("or", () => {
  class AEvent extends WorkflowEvent<{ a: string }> {}

  class BEvent extends WorkflowEvent<{ b: string }> {}

  const a = new AEvent({ a: "a" });
  const b = new BEvent({ b: "b" });
  const OR = WorkflowEvent.or(AEvent, BEvent);
  expect(a instanceof BEvent).toBe(false);
  expect(b instanceof AEvent).toBe(false);
  expect(a instanceof OR).toBe(true);
  expect(b instanceof OR).toBe(true);
});
