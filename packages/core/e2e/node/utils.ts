import { Settings, type LLMEndEvent } from "llamaindex";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

type MockStorage = {
  llmEventEnd: LLMEndEvent["detail"]["payload"];
}[];

export const llmCompleteMockStorage: MockStorage = [];

export const testRootDir = fileURLToPath(new URL(".", import.meta.url));

export function mockLLMEndSnapshot(snapshotName: string) {
  const newLLMCompleteMockStorage: MockStorage = [];

  function captureLLMEnd(event: LLMEndEvent) {
    newLLMCompleteMockStorage.push({
      llmEventEnd: event.detail.payload,
    });
  }

  test.beforeEach(async () => {
    await readFile(join(testRootDir, "snapshot", `${snapshotName}.snap`), {
      encoding: "utf-8",
    }).then((data) => {
      JSON.parse(data).forEach((item: MockStorage[0]) => {
        llmCompleteMockStorage.push(item);
      });
    });
    Settings.callbackManager.on("llm-end", captureLLMEnd);
  });
  test.afterEach(async () => {
    Settings.callbackManager.off("llm-end", captureLLMEnd);
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    if (process.env.UPDATE_SNAPSHOT === "1") {
      await writeFile(
        join(testRootDir, "snapshot", `${snapshotName}.snap`),
        JSON.stringify(newLLMCompleteMockStorage, null, 2),
      );
      return;
    }
    // if newLLMCompleteMockStorage captures and not equal to globalThis.llmCompleteMockStorage
    if (newLLMCompleteMockStorage.length !== llmCompleteMockStorage.length) {
      throw new Error("New LLMEndEvent does not match, please update snapshot");
    }
  });
}
