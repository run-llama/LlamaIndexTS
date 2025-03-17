import { Sandbox } from "@e2b/code-interpreter";
import path from "path";
import { describe, expect, test, vi } from "vitest";
import {
  interpreter,
  type InterpreterToolOutput,
} from "../src/tools/interpreter";

vi.mock("@e2b/code-interpreter", () => ({
  Sandbox: {
    create: vi.fn().mockImplementation(() => ({
      runCode: vi.fn().mockResolvedValue({
        error: null,
        logs: {
          stdout: ["Hello, World!", "x = 2"],
          stderr: [],
        },
        text: "Hello, World!\nx = 2",
        results: [
          {
            formats: () => [],
          },
        ],
      }),
      files: {
        write: vi.fn().mockResolvedValue(undefined),
      },
    })),
  },
}));

describe("Code Interpreter Tool", () => {
  test("executes simple python code", async () => {
    const interpreterTool = interpreter({
      apiKey: "mock-api-key",
      outputDir: path.join(__dirname, "output"),
      uploadedFilesDir: path.join(__dirname, "files"),
    });

    const result = (await interpreterTool.call({
      code: "print('Hello, World!')\nx = 1 + 1\nprint(f'x = {x}')",
    })) as InterpreterToolOutput;

    expect(Sandbox.create).toHaveBeenCalledWith({ apiKey: "mock-api-key" });
    expect(result.isError).toBe(false);
    expect(result.logs.stdout).toEqual(["Hello, World!", "x = 2"]);
    expect(result.retryCount).toBe(1);
    expect(result.extraResult).toEqual([]);
  });
});
