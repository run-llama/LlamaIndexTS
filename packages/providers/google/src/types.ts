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

export type GeminiMessageRole = "user" | "model" | "function";

export type GeminiVoiceName =
  | "Puck"
  | "Charon"
  | "Fenrir"
  | "Aoede"
  | "Leda"
  | "Kore"
  | "Orus"
  | "Zephyr";
