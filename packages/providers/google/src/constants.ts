import {
  HarmBlockThreshold,
  HarmCategory,
  type SafetySetting,
} from "@google/genai";
import { GEMINI_MODEL, type GeminiModelInfo } from "./types.js";

export const GEMINI_MODEL_INFO_MAP: Record<GEMINI_MODEL, GeminiModelInfo> = {
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

export const FILE_EXT_MIME_TYPES: { [key: string]: string } = {
  png: "image/png",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export const ACCEPTED_IMAGE_MIME_TYPES = Object.values(FILE_EXT_MIME_TYPES);
