export type OpenEvent = { type: "open" };

export type AudioEvent = { type: "audio"; delta: string };

export type TextEvent = { type: "text"; content: string };

export type ErrorEvent = { type: "error"; error: unknown };

export type CloseEvent = { type: "close" };

export type SetupCompleteEvent = { type: "setupComplete" };

export type GeminiLiveEvent =
  | OpenEvent
  | AudioEvent
  | TextEvent
  | ErrorEvent
  | CloseEvent
  | SetupCompleteEvent;

export const liveEvents = {
  open: { include: (e: GeminiLiveEvent): e is OpenEvent => e.type === "open" },
  audio: {
    include: (e: GeminiLiveEvent): e is AudioEvent => e.type === "audio",
  },
  text: { include: (e: GeminiLiveEvent): e is TextEvent => e.type === "text" },
  error: {
    include: (e: GeminiLiveEvent): e is ErrorEvent => e.type === "error",
  },
  close: {
    include: (e: GeminiLiveEvent): e is CloseEvent => e.type === "close",
  },
  setupComplete: {
    include: (e: GeminiLiveEvent): e is SetupCompleteEvent =>
      e.type === "setupComplete",
  },
};
