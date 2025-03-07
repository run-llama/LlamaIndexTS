---
"@llamaindex/google": minor
---

google vertex ai don't support empty functionDeclarations array. You must pass an empty array to LLMAgent if you don't have tools so Gemini was no able to use it in agent mode. Also Gemini 2.0 flash lite was added to model list.
