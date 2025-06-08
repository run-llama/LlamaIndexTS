import type {
  MessageContentAudioDetail,
  MessageContentTextDetail,
} from "../type";

export type OpenEvent = { type: "open" };

export type AudioEvent = MessageContentAudioDetail;

export type TextEvent = MessageContentTextDetail;

export type ErrorEvent = { type: "error"; error: unknown };

export type CloseEvent = { type: "close" };

export type SetupCompleteEvent = { type: "setupComplete" };

// a client message has interrupted current model generation
export type InterruptedEvent = { type: "interrupted" };

export type GenerationCompleteEvent = { type: "generationComplete" };

export type TurnCompleteEvent = { type: "turnComplete" };

export type LiveEvent =
  | OpenEvent
  | AudioEvent
  | TextEvent
  | ErrorEvent
  | CloseEvent
  | SetupCompleteEvent
  | InterruptedEvent
  | GenerationCompleteEvent
  | TurnCompleteEvent;

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
  interrupted: {
    include: (e: LiveEvent): e is InterruptedEvent => e.type === "interrupted",
  },
  generationComplete: {
    include: (e: LiveEvent): e is GenerationCompleteEvent =>
      e.type === "generationComplete",
  },
  turnComplete: {
    include: (e: LiveEvent): e is TurnCompleteEvent =>
      e.type === "turnComplete",
  },
};
