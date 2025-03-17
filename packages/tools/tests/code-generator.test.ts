import { Settings } from "@llamaindex/core/global";
import { MockLLM } from "@llamaindex/core/utils";
import { describe, expect, test } from "vitest";
import {
  codeGenerator,
  type CodeGeneratorToolOutput,
} from "../src/tools/code-generator";

Settings.llm = new MockLLM({
  responseMessage: `{
    "commentary": "Creating a simple Next.js page with a hello world message",
    "template": "nextjs-developer",
    "title": "Hello World App",
    "description": "A simple Next.js hello world application",
    "additional_dependencies": [],
    "has_additional_dependencies": false,
    "install_dependencies_command": "",
    "port": 3000,
    "file_path": "pages/index.tsx",
    "code": "export default function Home() { return <h1>Hello World</h1> }"
  }`,
});

describe("Code Generator Tool", () => {
  test("generates Next.js application code", async () => {
    const generator = codeGenerator();
    const result = (await generator.call({
      requirement: "Create a simple Next.js hello world page",
    })) as CodeGeneratorToolOutput;

    expect(result.isError).toBe(false);
    expect(result.artifact).toBeDefined();
    expect(result.artifact?.template).toBe("nextjs-developer");
    expect(result.artifact?.file_path).toBe("pages/index.tsx");
    expect(result.artifact?.code).toContain("export default");
  });
});
