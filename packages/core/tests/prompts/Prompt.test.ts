import { describe, expect, it } from "vitest";

import { Prompt } from "../../src/prompts/types.js";

describe("Prompt", () => {
  it("should format messages prompt", () => {
    const prompt = new Prompt(`
      messages:
        - content:  hello, {{name}}
          role: user
    `);
    const result = prompt.format({ name: "world" });
    expect(result).toEqual([{ content: "hello, world", role: "user" }]);
  });

  it("should format single prompt", () => {
    const prompt = new Prompt("hello, {{name}}");
    const result = prompt.format({ name: "world" });
    expect(result).toEqual("hello, world");
  });

  it("should format a prompt with a language section", () => {
    const prompt = new Prompt(
      "lang-en:\n  messages:\n    - content: 'hello, {{name}}'\n      role: user",
    );
    const result = prompt.format({ name: "world" }, { lang: "en" });
    expect(result).toEqual([{ content: "hello, world", role: "user" }]);
  });

  it("should format a prompt with a language section and LLM section", () => {
    const prompt = new Prompt(`
      lang-en:
        llm-gpt3:
          messages:
            - content: 'hello, {{name}}'
              role: user
    `);
    const result = prompt.format(
      { name: "world" },
      { lang: "en", llm: "gpt3" },
    );
    expect(result).toEqual([{ content: "hello, world", role: "user" }]);
  });

  it("should format a prompt with a default language section and LLM section", () => {
    const prompt = new Prompt(`
      lang-default:
        llm-gpt3:
          messages:
            - content: hello, {{name}}
              role: user
    `);
    const result = prompt.format({ name: "world" }, { llm: "gpt3" });
    expect(result).toEqual([{ content: "hello, world", role: "user" }]);
  });

  it("should format a prompt with a default language section and default LLM section", () => {
    const prompt = new Prompt(`
      lang-default:
        llm-default:
          messages:
            - content: hello, {{name}}
              role: user
    `);
    const result = prompt.format({ name: "world" });
    expect(result).toEqual([{ content: "hello, world", role: "user" }]);
  });

  it("should format a default prompt", () => {
    const prompt = new Prompt(`
      default:
        hello, {{name}}
    `);
    const result = prompt.format({ name: "world" });
    expect(result).toEqual("hello, world");
  });
});
