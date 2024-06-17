import { AsyncLocalStorage } from "@llamaindex/env";
import { CallbackManager } from "../../callbacks/CallbackManager.js";

const callbackManagerAsyncLocalStorage =
  new AsyncLocalStorage<CallbackManager>();
let globalCallbackManager: CallbackManager | null = null;

export function getCallbackManager(): CallbackManager {
  if (globalCallbackManager === null) {
    globalCallbackManager = new CallbackManager();
  }

  return callbackManagerAsyncLocalStorage.getStore() ?? globalCallbackManager;
}

export function setCallbackManager(callbackManager: CallbackManager) {
  globalCallbackManager = callbackManager;
}

export function withCallbackManager<Result>(
  callbackManager: CallbackManager,
  fn: () => Result,
): Result {
  return callbackManagerAsyncLocalStorage.run(callbackManager, fn);
}
