import {
  HarmBlockThreshold,
  HarmCategory,
  type SafetySetting,
} from "@google/genai";
import type { MessageType } from "@llamaindex/core/llms";

export enum GEMINI_MODEL {
  GEMINI_PRO = "gemini-pro",
  GEMINI_PRO_VISION = "gemini-pro-vision",
  GEMINI_PRO_LATEST = "gemini-1.5-pro-latest",
  GEMINI_PRO_FLASH_LATEST = "gemini-1.5-flash-latest",
  GEMINI_PRO_1_5_PRO_PREVIEW = "gemini-1.5-pro-preview-0514",
  GEMINI_PRO_1_5_FLASH_PREVIEW = "gemini-1.5-flash-preview-0514",
  GEMINI_PRO_1_5 = "gemini-1.5-pro-001",
  GEMINI_PRO_1_5_FLASH = "gemini-1.5-flash-001",
  // Note: should be switched to -latest suffix when google supports it
  GEMINI_PRO_1_5_LATEST = "gemini-1.5-pro-002",
  GEMINI_PRO_1_5_FLASH_LATEST = "gemini-1.5-flash-002",
  GEMINI_2_0_FLASH_EXPERIMENTAL = "gemini-2.0-flash-exp",
  GEMINI_2_0_FLASH = "gemini-2.0-flash-001",
  GEMINI_2_0_FLASH_LITE = "gemini-2.0-flash-lite-001",
  GEMINI_2_0_FLASH_LITE_PREVIEW = "gemini-2.0-flash-lite-preview-02-05",
  GEMINI_2_0_FLASH_THINKING_EXP = "gemini-2.0-flash-thinking-exp-01-21",
  GEMINI_2_0_PRO_EXPERIMENTAL = "gemini-2.0-pro-exp-02-05",
  GEMINI_2_0_FLASH_LIVE = "gemini-2.0-flash-live-001",
  GEMINI_2_5_PRO_PREVIEW = "gemini-2.5-pro-preview-03-25",
  GEMINI_2_5_PRO_PREVIEW_LATEST = "gemini-2.5-pro-preview-06-05",
  GEMINI_2_5_FLASH_PREVIEW = "gemini-2.5-flash-preview-05-20",
}

export const GEMINI_MODEL_INFO_MAP: Record<
  GEMINI_MODEL,
  { contextWindow: number }
> = {
  [GEMINI_MODEL.GEMINI_PRO]: { contextWindow: 30720 },
  [GEMINI_MODEL.GEMINI_PRO_VISION]: { contextWindow: 12288 },
  // multi-modal/multi turn
  [GEMINI_MODEL.GEMINI_PRO_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_FLASH_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_PRO_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5]: { contextWindow: 2 * 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_FLASH]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_LATEST]: { contextWindow: 2 * 10 ** 6 },
  [GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_EXPERIMENTAL]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_LITE_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_LITE]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_LIVE]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_0_FLASH_THINKING_EXP]: { contextWindow: 32768 },
  [GEMINI_MODEL.GEMINI_2_0_PRO_EXPERIMENTAL]: { contextWindow: 2 * 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW_LATEST]: { contextWindow: 10 ** 6 },
  [GEMINI_MODEL.GEMINI_2_5_FLASH_PREVIEW]: { contextWindow: 10 ** 6 },
};

export const SUPPORT_TOOL_CALL_MODELS: GEMINI_MODEL[] = [
  GEMINI_MODEL.GEMINI_PRO,
  GEMINI_MODEL.GEMINI_PRO_VISION,
  GEMINI_MODEL.GEMINI_PRO_1_5_PRO_PREVIEW,
  GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_PREVIEW,
  GEMINI_MODEL.GEMINI_PRO_1_5,
  GEMINI_MODEL.GEMINI_PRO_1_5_FLASH,
  GEMINI_MODEL.GEMINI_PRO_LATEST,
  GEMINI_MODEL.GEMINI_PRO_FLASH_LATEST,
  GEMINI_MODEL.GEMINI_PRO_1_5_LATEST,
  GEMINI_MODEL.GEMINI_PRO_1_5_FLASH_LATEST,
  GEMINI_MODEL.GEMINI_2_0_FLASH_EXPERIMENTAL,
  GEMINI_MODEL.GEMINI_2_0_FLASH,
  GEMINI_MODEL.GEMINI_2_0_PRO_EXPERIMENTAL,
  GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW,
  GEMINI_MODEL.GEMINI_2_5_PRO_PREVIEW_LATEST,
  GEMINI_MODEL.GEMINI_2_5_FLASH_PREVIEW,
];

export const DEFAULT_GEMINI_PARAMS = {
  model: GEMINI_MODEL.GEMINI_PRO,
  temperature: 0.1,
  topP: 1,
  maxTokens: undefined,
};

/**
 * Safety settings to disable external filters
 * Documentation: https://ai.google.dev/gemini-api/docs/safety-settings
 */
export const DEFAULT_SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export enum GEMINI_MESSAGE_ROLE {
  USER = "user",
  MODEL = "model",
  FUNCTION = "function",
}

export enum GEMINI_VOICE_NAME {
  PUCK = "Puck",
  CHARON = "Charon",
  FENRIR = "Fenrir",
  AOEDE = "Aoede",
  LEDA = "Leda",
  KORE = "Kore",
  ORUS = "Orus",
  ZEPHYR = "Zephyr",
}

// Gemini only has user and model roles. Put the rest in user role.
export const ROLES_TO_GEMINI: Record<MessageType, GEMINI_MESSAGE_ROLE> = {
  assistant: GEMINI_MESSAGE_ROLE.MODEL,
  user: GEMINI_MESSAGE_ROLE.USER,
  system: GEMINI_MESSAGE_ROLE.USER,
  memory: GEMINI_MESSAGE_ROLE.USER,
  developer: GEMINI_MESSAGE_ROLE.USER,
};

export const ROLES_FROM_GEMINI: Record<GEMINI_MESSAGE_ROLE, MessageType> = {
  [GEMINI_MESSAGE_ROLE.MODEL]: "assistant",
  [GEMINI_MESSAGE_ROLE.USER]: "user",
  [GEMINI_MESSAGE_ROLE.FUNCTION]: "user",
};
