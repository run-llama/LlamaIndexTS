import { ALL_AVAILABLE_OPENAI_MODELS } from "../../../llm";
import { isFunctionCallingModel } from "../../../llm/openai/utils";

describe("openai/utils", () => {
  test("shouldn't be a old model", () => {
    expect(isFunctionCallingModel("gpt-3.5-turbo")).toBe(true);
    expect(isFunctionCallingModel("gpt-3.5-turbo-0314")).toBe(false);
    expect(isFunctionCallingModel("gpt-3.5-turbo-0301")).toBe(false);
    expect(isFunctionCallingModel("gpt-3.5-turbo-0314-0301")).toBe(false);
    expect(isFunctionCallingModel("gpt-3.5-turbo-0314-0301-0314-0301")).toBe(
      false,
    );
    expect(
      isFunctionCallingModel("gpt-3.5-turbo-0314-0301-0314-0301-0314-0301"),
    ).toBe(false);
  });

  test("should be a open ai model", () => {
    const models = Object.keys(ALL_AVAILABLE_OPENAI_MODELS).filter(
      (model) => !model.includes("0314") && !model.includes("0301"),
    );

    models.forEach((model) => {
      expect(isFunctionCallingModel(model)).toBe(true);
    });
  });
});
