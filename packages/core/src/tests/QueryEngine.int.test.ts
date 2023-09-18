import { LLM, MessageType } from "../llm/LLM";
import MockLLM from "../llm/mock";
import { defaultMultiSelectPrompt } from "../Prompt";
import { LLMSelector } from "../Selector";
import { RouterQueryEngine } from "../QueryEngine";
import { ToolMetadata } from "../Tool";

describe("Selector ", () => {
  test(".select method compiles", async () => {
    //In-memory integration test for RouterQueryEngine
    //Warning: This alone doesn't mean that RQE works for every LLM and every prompt.

    const msgType: MessageType = "user";
    const regVal = {
      message: {
        content: `[{"answer": 0, "reason": "something"}]`,
        role: msgType,
      },
    };

    //Using an empty mock LLM, override the .complete() method
    // + use a dummy prompt
    const fakeLLM: LLM = new MockLLM();
    fakeLLM.complete = async (query: string) => {
      return regVal;
    };

    //LLM Selector method
    const selector: LLMSelector = new LLMSelector(
      fakeLLM,
      defaultMultiSelectPrompt,
    );

    const fakeToolData: ToolMetadata[]
    const final_val = await selector.select("something", [
      { name: "something1", description: "something2" },
    ]);

    //Final expect value
    expect(final_val).toEqual([{ answer: 0, reason: "something" }]);
  });
});