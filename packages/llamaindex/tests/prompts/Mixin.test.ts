import { PromptMixin } from "llamaindex/prompts/index";
import { describe, expect, it } from "vitest";

type MockPrompt = {
  context: string;
  query: string;
};

const mockPrompt = ({ context, query }: MockPrompt) =>
  `context: ${context} query: ${query}`;

const mockPrompt2 = ({ context, query }: MockPrompt) =>
  `query: ${query} context: ${context}`;

type MockPromptFunction = typeof mockPrompt;

class MockObject2 extends PromptMixin {
  _prompt_dict_2: MockPromptFunction;

  constructor() {
    super();
    this._prompt_dict_2 = mockPrompt;
  }

  protected _getPrompts(): { [x: string]: MockPromptFunction } {
    return {
      abc: this._prompt_dict_2,
    };
  }

  _updatePrompts(promptsDict: { [x: string]: MockPromptFunction }): void {
    if ("abc" in promptsDict) {
      this._prompt_dict_2 = promptsDict["abc"];
    }
  }
}

class MockObject1 extends PromptMixin {
  mockObject2: MockObject2;

  fooPrompt: MockPromptFunction;
  barPrompt: MockPromptFunction;

  constructor() {
    super();
    this.mockObject2 = new MockObject2();
    this.fooPrompt = mockPrompt;
    this.barPrompt = mockPrompt;
  }

  protected _getPrompts(): { [x: string]: any } {
    return {
      bar: this.barPrompt,
      foo: this.fooPrompt,
    };
  }

  protected _getPromptModules(): { [x: string]: any } {
    return { mock_object_2: this.mockObject2 };
  }

  _updatePrompts(promptsDict: { [x: string]: any }): void {
    if ("bar" in promptsDict) {
      this.barPrompt = promptsDict["bar"];
    }
    if ("foo" in promptsDict) {
      this.fooPrompt = promptsDict["foo"];
    }
  }
}

describe("PromptMixin", () => {
  it("should return prompts", () => {
    const mockObj1 = new MockObject1();

    const prompts = mockObj1.getPrompts();

    expect(
      mockObj1.fooPrompt({
        context: "{foo}",
        query: "{foo}",
      }),
    ).toEqual("context: {foo} query: {foo}");

    expect(
      mockObj1.barPrompt({
        context: "{foo} {bar}",
        query: "{foo} {bar}",
      }),
    ).toEqual("context: {foo} {bar} query: {foo} {bar}");

    expect(mockObj1.fooPrompt).toEqual(prompts.foo);
    expect(mockObj1.barPrompt).toEqual(prompts.bar);

    expect(mockObj1.getPrompts()).toEqual({
      bar: mockPrompt,
      foo: mockPrompt,
      "mock_object_2:abc": mockPrompt,
    });
  });

  it("should update prompts", () => {
    const mockObj1 = new MockObject1();

    expect(
      mockObj1.barPrompt({
        context: "{foo} {bar}",
        query: "{foo} {bar}",
      }),
    ).toEqual(mockPrompt({ context: "{foo} {bar}", query: "{foo} {bar}" }));

    expect(
      mockObj1.mockObject2._prompt_dict_2({
        context: "{bar} testing",
        query: "{bar} testing",
      }),
    ).toEqual(mockPrompt({ context: "{bar} testing", query: "{bar} testing" }));

    mockObj1.updatePrompts({
      bar: mockPrompt2,
      "mock_object_2:abc": mockPrompt2,
    });

    expect(
      mockObj1.barPrompt({
        context: "{foo} {bar}",
        query: "{bar} {foo}",
      }),
    ).toEqual(mockPrompt2({ context: "{foo} {bar}", query: "{bar} {foo}" }));
    expect(
      mockObj1.mockObject2._prompt_dict_2({
        context: "{bar} testing",
        query: "{bar} testing",
      }),
    ).toEqual(
      mockPrompt2({ context: "{bar} testing", query: "{bar} testing" }),
    );
  });
});
