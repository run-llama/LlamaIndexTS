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
