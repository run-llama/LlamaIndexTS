import type {
  AudioEvent,
  CloseEvent,
  ErrorEvent,
  OpenEvent,
  SetupCompleteEvent,
  TextEvent,
} from "@llamaindex/core/llms";

import type { LiveEvent } from "@llamaindex/core/llms";

export const liveEvents = {
  open: { include: (e: LiveEvent): e is OpenEvent => e.type === "open" },
  audio: {
    include: (e: LiveEvent): e is AudioEvent => e.type === "audio",
  },
  text: { include: (e: LiveEvent): e is TextEvent => e.type === "text" },
  error: {
    include: (e: LiveEvent): e is ErrorEvent => e.type === "error",
  },
  close: {
    include: (e: LiveEvent): e is CloseEvent => e.type === "close",
  },
  setupComplete: {
    include: (e: LiveEvent): e is SetupCompleteEvent =>
      e.type === "setupComplete",
  },
};
