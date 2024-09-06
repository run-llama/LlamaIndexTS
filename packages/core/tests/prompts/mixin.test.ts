import {
  type ModuleRecord,
  PromptMixin,
  PromptTemplate,
} from "@llamaindex/core/prompts";
import { describe, expect, it } from "vitest";

const mockPrompt = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `context: {context} query: {query}`,
});

const mockPrompt2 = new PromptTemplate({
  templateVars: ["context", "query"],
  template: `query: {query} context: {context}`,
});

type MockPrompt = typeof mockPrompt;

class MockObject2 extends PromptMixin {
  _prompt_dict_2: MockPrompt;

  constructor() {
    super();
    this._prompt_dict_2 = mockPrompt;
  }

  protected _getPrompts() {
    return {
      abc: this._prompt_dict_2,
    };
  }

  protected _updatePrompts(prompts: { abc: MockPrompt }): void {
    if ("abc" in prompts) {
      this._prompt_dict_2 = prompts["abc"];
    }
  }

  protected _getPromptModules(): ModuleRecord {
    return {};
  }
}

class MockObject1 extends PromptMixin {
  mockObject2: MockObject2;

  fooPrompt: MockPrompt;
  barPrompt: MockPrompt;

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
      mockObj1.fooPrompt.format({
        context: "{foo}",
        query: "{foo}",
      }),
    ).toEqual("context: {foo} query: {foo}");

    expect(
      mockObj1.barPrompt.format({
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
      mockObj1.barPrompt.format({
        context: "{foo} {bar}",
        query: "{foo} {bar}",
      }),
    ).toEqual(
      mockPrompt.format({ context: "{foo} {bar}", query: "{foo} {bar}" }),
    );

    expect(
      mockObj1.mockObject2._prompt_dict_2.format({
        context: "{bar} testing",
        query: "{bar} testing",
      }),
    ).toEqual(
      mockPrompt.format({ context: "{bar} testing", query: "{bar} testing" }),
    );

    mockObj1.updatePrompts({
      bar: mockPrompt2,
      "mock_object_2:abc": mockPrompt2,
    });

    expect(
      mockObj1.barPrompt.format({
        context: "{foo} {bar}",
        query: "{bar} {foo}",
      }),
    ).toEqual(
      mockPrompt2.format({ context: "{foo} {bar}", query: "{bar} {foo}" }),
    );
    expect(
      mockObj1.mockObject2._prompt_dict_2.format({
        context: "{bar} testing",
        query: "{bar} testing",
      }),
    ).toEqual(
      mockPrompt2.format({ context: "{bar} testing", query: "{bar} testing" }),
    );
  });
});
