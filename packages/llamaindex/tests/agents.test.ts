import { validateAgentParams } from "llamaindex/agent/utils";
import { expect, test } from "vitest";
import { ZodError } from "zod";

test("validate agent params", () => {
  validateAgentParams({
    tools: [],
  });
  expect(() =>
    validateAgentParams({
      tools: [
        {
          call: null!,
          metadata: {
            name: "test",
            parameters: {},
            description: "test description",
          },
        },
      ],
    }),
  ).toThrowError(ZodError);
  validateAgentParams({
    tools: [
      {
        call: () => "",
        metadata: {
          name: "test",
          parameters: {},
          description: "test description",
        },
      },
    ],
  });
});
