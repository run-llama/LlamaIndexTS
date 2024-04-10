import { Settings, type LLMEndEvent, type LLMStartEvent } from "llamaindex";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type test } from "node:test";
import { fileURLToPath } from "node:url";

type MockStorage = {
  llmEventStart: LLMStartEvent["detail"]["payload"][];
  llmEventEnd: LLMEndEvent["detail"]["payload"][];
};

export const llmCompleteMockStorage: MockStorage = {
  llmEventStart: [],
  llmEventEnd: [],
};

export const testRootDir = fileURLToPath(new URL(".", import.meta.url));

export async function mockLLMEvent(
  t: Parameters<NonNullable<Parameters<typeof test>[0]>>[0],
  snapshotName: string,
) {
  const newLLMCompleteMockStorage: MockStorage = {
    llmEventStart: [],
    llmEventEnd: [],
  };

  function captureLLMStart(event: LLMStartEvent) {
    newLLMCompleteMockStorage.llmEventStart.push(event.detail.payload);
  }

  function captureLLMEnd(event: LLMEndEvent) {
    newLLMCompleteMockStorage.llmEventEnd.push(event.detail.payload);
  }

  await readFile(join(testRootDir, "snapshot", `${snapshotName}.snap`), {
    encoding: "utf-8",
  }).then((data) => {
    const result = JSON.parse(data) as MockStorage;
    result["llmEventEnd"].forEach((event) => {
      llmCompleteMockStorage.llmEventEnd.push(event);
    });
    result["llmEventStart"].forEach((event) => {
      llmCompleteMockStorage.llmEventStart.push(event);
    });
  });
  Settings.callbackManager.on("llm-start", captureLLMStart);
  Settings.callbackManager.on("llm-end", captureLLMEnd);

  t.after(async () => {
    Settings.callbackManager.off("llm-end", captureLLMEnd);
    Settings.callbackManager.off("llm-start", captureLLMStart);
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    if (process.env.UPDATE_SNAPSHOT === "1") {
      await writeFile(
        join(testRootDir, "snapshot", `${snapshotName}.snap`),
        JSON.stringify(newLLMCompleteMockStorage, null, 2),
      );
      return;
    }
    if (
      newLLMCompleteMockStorage.llmEventEnd.length !==
      llmCompleteMockStorage.llmEventEnd.length
    ) {
      throw new Error("New LLMEndEvent does not match, please update snapshot");
    }
    if (
      newLLMCompleteMockStorage.llmEventStart.length !==
      llmCompleteMockStorage.llmEventStart.length
    ) {
      throw new Error(
        "New LLMStartEvent does not match, please update snapshot",
      );
    }
  });
  // cleanup
  t.after(() => {
    llmCompleteMockStorage.llmEventEnd = [];
    llmCompleteMockStorage.llmEventStart = [];
  });
}
