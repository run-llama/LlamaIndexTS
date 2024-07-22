/* eslint-disable turbo/no-undeclared-env-vars */
import {
  Settings,
  type LLMEndEvent,
  type LLMStartEvent,
  type LLMStreamEvent,
} from "@llamaindex/core/global";
import { CustomEvent } from "@llamaindex/env";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type test } from "node:test";
import { fileURLToPath } from "node:url";

type MockStorage = {
  llmEventStart: LLMStartEvent[];
  llmEventEnd: LLMEndEvent[];
  llmEventStream: LLMStreamEvent[];
};

export const llmCompleteMockStorage: MockStorage = {
  llmEventStart: [],
  llmEventEnd: [],
  llmEventStream: [],
};

export const testRootDir = fileURLToPath(new URL(".", import.meta.url));

export async function mockLLMEvent(
  t: Parameters<NonNullable<Parameters<typeof test>[0]>>[0],
  snapshotName: string,
) {
  const idMap = new Map<string, string>();
  let counter = 0;
  const newLLMCompleteMockStorage: MockStorage = {
    llmEventStart: [],
    llmEventEnd: [],
    llmEventStream: [],
  };

  function captureLLMStart(event: CustomEvent<LLMStartEvent>) {
    idMap.set(event.detail.id, `PRESERVE_${counter++}`);
    newLLMCompleteMockStorage.llmEventStart.push({
      ...event.detail,
      // @ts-expect-error id is not UUID, but it is fine for testing
      id: idMap.get(event.detail.payload.id)!,
    });
  }

  function captureLLMEnd(event: CustomEvent<LLMEndEvent>) {
    newLLMCompleteMockStorage.llmEventEnd.push({
      ...event.detail,
      // @ts-expect-error id is not UUID, but it is fine for testing
      id: idMap.get(event.detail.payload.id)!,
      response: {
        ...event.detail.response,
        // hide raw object since it might too big
        raw: null,
      },
    });
  }

  function captureLLMStream(event: CustomEvent<LLMStreamEvent>) {
    newLLMCompleteMockStorage.llmEventStream.push({
      ...event.detail,
      // @ts-expect-error id is not UUID, but it is fine for testing
      id: idMap.get(event.detail.payload.id)!,
      chunk: {
        ...event.detail.chunk,
        // hide raw object since it might too big
        raw: null,
      },
    });
  }

  await readFile(join(testRootDir, "snapshot", `${snapshotName}.snap`), {
    encoding: "utf-8",
  })
    .then((data) => {
      const result = JSON.parse(data) as MockStorage;
      result["llmEventEnd"].forEach((event) => {
        llmCompleteMockStorage.llmEventEnd.push(event);
      });
      result["llmEventStart"].forEach((event) => {
        llmCompleteMockStorage.llmEventStart.push(event);
      });
      result["llmEventStream"].forEach((event) => {
        llmCompleteMockStorage.llmEventStream.push(event);
      });
    })
    .catch((error) => {
      if (error.code === "ENOENT") {
        console.warn("Snapshot file not found, will create a new one");
        return;
      }
    });
  Settings.callbackManager.on("llm-start", captureLLMStart);
  Settings.callbackManager.on("llm-end", captureLLMEnd);
  Settings.callbackManager.on("llm-stream", captureLLMStream);

  t.after(async () => {
    Settings.callbackManager.off("llm-stream", captureLLMStream);
    Settings.callbackManager.off("llm-end", captureLLMEnd);
    Settings.callbackManager.off("llm-start", captureLLMStart);
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    if (process.env.UPDATE_SNAPSHOT === "1") {
      const data = JSON.stringify(newLLMCompleteMockStorage, null, 2);
      await writeFile(
        join(testRootDir, "snapshot", `${snapshotName}.snap`),
        data,
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

    if (
      newLLMCompleteMockStorage.llmEventStream.length !==
      llmCompleteMockStorage.llmEventStream.length
    ) {
      throw new Error(
        "New LLMStreamEvent does not match, please update snapshot",
      );
    }
  });
  // cleanup
  t.after(() => {
    llmCompleteMockStorage.llmEventEnd = [];
    llmCompleteMockStorage.llmEventStart = [];
    llmCompleteMockStorage.llmEventStream = [];
  });
}
