import { describe, expect, test } from "vitest";
import {
  BEDROCK_MODEL_MAX_TOKENS,
  BEDROCK_MODELS,
  INFERENCE_BEDROCK_MODELS,
  INFERENCE_TO_BEDROCK_MAP,
  STREAMING_MODELS,
  TOOL_CALL_MODELS,
} from "../src/llm/bedrock/index";

const allBedrockModelValues = Object.values(BEDROCK_MODELS);
const allInferenceModelValues = Object.values(INFERENCE_BEDROCK_MODELS);

describe("BEDROCK_MODELS", () => {
  test("all model IDs should be unique", () => {
    const seen = new Set<string>();
    for (const value of allBedrockModelValues) {
      expect(seen.has(value), `Duplicate model ID: ${value}`).toBe(false);
      seen.add(value);
    }
  });
});

describe("INFERENCE_TO_BEDROCK_MAP", () => {
  test("every inference model should map to a valid BEDROCK_MODELS entry", () => {
    for (const [inferenceModel, bedrockModel] of Object.entries(
      INFERENCE_TO_BEDROCK_MAP,
    )) {
      expect(
        allBedrockModelValues.includes(bedrockModel),
        `Inference model ${inferenceModel} maps to ${bedrockModel} which is not in BEDROCK_MODELS`,
      ).toBe(true);
    }
  });

  test("every INFERENCE_BEDROCK_MODELS value should have a mapping", () => {
    const mappedInferenceModels = Object.keys(INFERENCE_TO_BEDROCK_MAP);
    for (const inferenceModel of allInferenceModelValues) {
      expect(
        mappedInferenceModels.includes(inferenceModel),
        `Inference model ${inferenceModel} has no entry in INFERENCE_TO_BEDROCK_MAP`,
      ).toBe(true);
    }
  });
});

describe("STREAMING_MODELS", () => {
  test("all TOOL_CALL_MODELS should also be in STREAMING_MODELS", () => {
    for (const model of TOOL_CALL_MODELS) {
      expect(
        STREAMING_MODELS.has(model),
        `Tool call model ${model} is not in STREAMING_MODELS`,
      ).toBe(true);
    }
  });
});

describe("BEDROCK_MODEL_MAX_TOKENS", () => {
  test("new Claude models should have max tokens entries", () => {
    const expectedModels = [
      BEDROCK_MODELS.ANTHROPIC_CLAUDE_OPUS_4_6,
      BEDROCK_MODELS.ANTHROPIC_CLAUDE_SONNET_4_6,
      BEDROCK_MODELS.ANTHROPIC_CLAUDE_OPUS_4_5,
      BEDROCK_MODELS.ANTHROPIC_CLAUDE_4_5_SONNET,
      BEDROCK_MODELS.ANTHROPIC_CLAUDE_HAIKU_4_5,
    ];
    for (const model of expectedModels) {
      expect(
        BEDROCK_MODEL_MAX_TOKENS[model],
        `Model ${model} should have a max tokens entry`,
      ).toBeDefined();
    }
  });

  test("new Meta Llama 4 models should have max tokens entries", () => {
    const expectedModels = [
      BEDROCK_MODELS.META_LLAMA4_SCOUT_17B_INSTRUCT,
      BEDROCK_MODELS.META_LLAMA4_MAVERICK_17B_INSTRUCT,
    ];
    for (const model of expectedModels) {
      expect(
        BEDROCK_MODEL_MAX_TOKENS[model],
        `Model ${model} should have a max tokens entry`,
      ).toBeDefined();
    }
  });

  test("Nova 2 Lite should have max tokens entry", () => {
    expect(
      BEDROCK_MODEL_MAX_TOKENS[BEDROCK_MODELS.AMAZON_NOVA_2_LITE],
    ).toBeDefined();
  });
});

describe("Removed models", () => {
  const removedInferenceModels = [
    "us.anthropic.claude-3-sonnet-20240229-v1:0",
    "us.anthropic.claude-3-opus-20240229-v1:0",
    "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "eu.anthropic.claude-3-5-sonnet-20240620-v1:0",
    "eu.anthropic.claude-3-5-haiku-20241022-v1:0",
    "eu.anthropic.claude-opus-4-20250514-v1:0",
    "eu.anthropic.claude-opus-4-1-20250805-v1:0",
    "eu.amazon.nova-premier-v1:0",
  ];

  test("removed cross-region inference models should not be present", () => {
    const inferenceValues: string[] = allInferenceModelValues;
    for (const modelId of removedInferenceModels) {
      expect(
        inferenceValues.includes(modelId),
        `Removed model ${modelId} should not be in INFERENCE_BEDROCK_MODELS`,
      ).toBe(false);
    }
  });
});

describe("Model data values", () => {
  test("Claude Opus 4.6 max tokens should be 128000", () => {
    expect(
      BEDROCK_MODEL_MAX_TOKENS[BEDROCK_MODELS.ANTHROPIC_CLAUDE_OPUS_4_6],
    ).toBe(128000);
  });

  test("Claude Sonnet 4.6 max tokens should be 64000", () => {
    expect(
      BEDROCK_MODEL_MAX_TOKENS[BEDROCK_MODELS.ANTHROPIC_CLAUDE_SONNET_4_6],
    ).toBe(64000);
  });

  test("Llama 4 Scout max tokens should be 16384", () => {
    expect(
      BEDROCK_MODEL_MAX_TOKENS[BEDROCK_MODELS.META_LLAMA4_SCOUT_17B_INSTRUCT],
    ).toBe(16384);
  });

  test("Llama 4 Maverick max tokens should be 16384", () => {
    expect(
      BEDROCK_MODEL_MAX_TOKENS[
        BEDROCK_MODELS.META_LLAMA4_MAVERICK_17B_INSTRUCT
      ],
    ).toBe(16384);
  });

  test("Nova 2 Lite max tokens should be 65536", () => {
    expect(BEDROCK_MODEL_MAX_TOKENS[BEDROCK_MODELS.AMAZON_NOVA_2_LITE]).toBe(
      65536,
    );
  });
});
