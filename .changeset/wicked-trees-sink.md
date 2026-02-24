---
"@llamaindex/aws": patch
"@llamaindex/community": patch
---

Add new AWS Bedrock models and fix incomplete entries:

- Add Anthropic Claude Haiku 4.5, Opus 4.5, Opus 4.6, and Sonnet 4.6
- Add Meta Llama 4 Scout 17B and Maverick 17B
- Add Amazon Nova 2 Lite
- Fix missing entries for Claude 4.1 Opus and Claude 4.5 Sonnet in context window, streaming, tool calling, and max tokens constants
- Add cross-region inference variants (US, EU, AU, JP, Global) based on AWS documentation
- Remove unsupported cross-region inference entries (US Claude 3 Sonnet, US Claude 3 Opus, EU Claude 3.5 Haiku, EU Claude 4 Opus, EU Claude 4.1 Opus, EU Nova Premier)
- Add new AU, JP, and Global inference profile prefixes for supported models
- Remove legacy US and EU Claude 3.5 Sonnet v1 cross-region inference models
- Make topP optional for Bedrock params and fix type compatibility with exactOptionalPropertyTypes
- Fix Claude Opus 4.6 max output tokens: 32K → 128K (per Anthropic docs)
- Fix Amazon Nova 2 Lite context window: 300K → 1M and max output: 5,120 → 65,536 (per AWS docs)

### BREAKING CHANGES — Removed Cross-Region Inference Models

The following `INFERENCE_BEDROCK_MODELS` entries have been removed because they are not supported by AWS for cross-region inference. If you reference any of these, update your code to use the recommended replacement:

| Removed Model ID                                    | Replacement                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `us.anthropic.claude-3-sonnet-20240229-v1:0`        | Use base `BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_SONNET` directly, or migrate to `US_ANTHROPIC_CLAUDE_3_7_SONNET` |
| `us.anthropic.claude-3-opus-20240229-v1:0`          | Use base `BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_OPUS` directly, or migrate to `US_ANTHROPIC_CLAUDE_OPUS_4_6`     |
| `us.anthropic.claude-3-5-sonnet-20240620-v1:0` (v1) | `US_ANTHROPIC_CLAUDE_3_5_SONNET_V2` (`us.anthropic.claude-3-5-sonnet-20241022-v2:0`)                         |
| `eu.anthropic.claude-3-5-sonnet-20240620-v1:0` (v1) | Use base model or `EU_ANTHROPIC_CLAUDE_4_5_SONNET`                                                           |
| `eu.anthropic.claude-3-5-haiku-20241022-v1:0`       | Use base `BEDROCK_MODELS.ANTHROPIC_CLAUDE_3_5_HAIKU` directly (not available in EU cross-region)             |
| `eu.anthropic.claude-opus-4-20250514-v1:0`          | `EU_ANTHROPIC_CLAUDE_OPUS_4_5` or `EU_ANTHROPIC_CLAUDE_OPUS_4_6`                                             |
| `eu.anthropic.claude-opus-4-1-20250805-v1:0`        | `EU_ANTHROPIC_CLAUDE_OPUS_4_5` or `EU_ANTHROPIC_CLAUDE_OPUS_4_6`                                             |
| `eu.amazon.nova-premier-v1:0`                       | Use base `BEDROCK_MODELS.AMAZON_NOVA_PREMIER_1` directly (not available in EU cross-region)                  |
