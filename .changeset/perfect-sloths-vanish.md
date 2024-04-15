---
"llamaindex": patch
"@llamaindex/edge": patch
---

feat: init anthropic agent

remove the `tool` | `function` type in `MessageType`. Replace with `assistant` instead. 
This is because these two types are only available for `OpenAI`.
Since `OpenAI` deprecates the function type, we support the Claude 3 tool call.
