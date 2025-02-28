import { LLMAgent, validateAgentParams } from "@llamaindex/core/agent";
import { MockLLM } from "@llamaindex/core/utils";
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

test("LLMAgent streaming: first chunk should be available immediately", async () => {
  const responseMessage =
    "This is a very long response message that should take a while to stream";
  const timeBetweenToken = 20; // delay time between tokens

  const agent = new LLMAgent({
    tools: [],
    llm: new MockLLM({ responseMessage, timeBetweenToken }),
  });

  const startTime = Date.now();
  const stream = await agent.chat({ message: "Hello", stream: true });

  let fullResponse = "";
  let timeToGetFirstChunk: number | undefined;

  for await (const chunk of stream) {
    expect(chunk).toHaveProperty("delta");
    fullResponse += chunk.delta;
    if (timeToGetFirstChunk === undefined) {
      timeToGetFirstChunk = Date.now() - startTime;
    }
  }

  expect(fullResponse).toBe(responseMessage);

  // the first chunk should be available immediately and no need the whole response to be sent
  expect(timeToGetFirstChunk).toBeLessThan(500);
});

test("LLMAgent create task: first task should be executed immediately", async () => {
  const responseMessage =
    "This is a very long response message that should take a while to stream";
  const timeBetweenToken = 20; // delay time between tokens

  const agent = new LLMAgent({
    tools: [],
    llm: new MockLLM({ responseMessage, timeBetweenToken }),
  });

  const startTime = Date.now();
  const task = agent.createTask("Write a long paragraph", true, false, []);

  let timeToGetFirstChunk: number | undefined;
  let output: ReadableStream | undefined;
  for await (const stepOutput of task) {
    if (timeToGetFirstChunk === undefined) {
      timeToGetFirstChunk = Date.now() - startTime;
    }
    if (stepOutput.output instanceof ReadableStream) {
      output = stepOutput.output;
    }
  }

  expect(timeToGetFirstChunk).toBeLessThan(500);
  expect(output).toBeDefined();
  expect(output).toBeInstanceOf(ReadableStream);
});
