import { PromptMixin } from "../../prompts";

type MockPrompt = {
  context: string;
  query: string;
};

const mockPrompt = ({ context, query }: MockPrompt) =>
  `context: ${context} query: ${query}`;

class MockObject2 extends PromptMixin {
  _prompt_dict_2: string;

  constructor() {
    super();
    this._prompt_dict_2 = mockPrompt({ context: "{abc}", query: "{def}" });
  }

  protected _getPrompts(): { [x: string]: any } {
    return {
      abc: this._prompt_dict_2,
    };
  }

  _updatePrompts(promptsDict: { [x: string]: any }): void {
    if ("abc" in promptsDict) {
      this._prompt_dict_2 = promptsDict["abc"];
    }
  }
}

class MockObject1 extends PromptMixin {
  mockObject2: MockObject2;

  fooPrompt: string;
  barPrompt: string;

  constructor() {
    super();
    this.mockObject2 = new MockObject2();
    this.fooPrompt = mockPrompt({ context: "{foo}", query: "{foo}" });
    this.barPrompt = mockPrompt({
      context: "{foo} {bar}",
      query: "{foo} {bar}",
    });
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
    expect(prompts).toEqual({
      bar: mockPrompt({ context: "{foo} {bar}", query: "{foo} {bar}" }),
      foo: mockPrompt({ context: "{foo}", query: "{foo}" }),
      "mock_object_2:abc": mockPrompt({ context: "{abc}", query: "{def}" }),
    });

    expect(mockObj1.mockObject2.getPrompts()).toEqual({
      abc: mockPrompt({ context: "{abc}", query: "{def}" }),
    });
  });

  it("should update prompts", () => {
    const mockObj1 = new MockObject1();

    mockObj1.updatePrompts({
      bar: mockPrompt({ context: "{bar} testing", query: "{bar} testing" }),
      "mock_object_2:abc": mockPrompt({
        context: "{abc} {def} ghi",
        query: "{abc} {def} ghi",
      }),
    });

    expect(mockObj1.getPrompts()).toEqual({
      bar: mockPrompt({ context: "{bar} testing", query: "{bar} testing" }),
      foo: mockPrompt({ context: "{foo}", query: "{foo}" }),
      "mock_object_2:abc": mockPrompt({
        context: "{abc} {def} ghi",
        query: "{abc} {def} ghi",
      }),
    });
  });
});
