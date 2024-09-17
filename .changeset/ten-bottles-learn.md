---
"@llamaindex/core": patch
"@llamaindex/experimental": patch
"llamaindex": patch
---

refactor: align `response-synthesizers` & `chat-engine` module

- builtin event system
- correct class extends
- aligin APIs, naming with llama-index python
- move stream out of first parameter to second parameter for the better tyep checking
- remove JSONQueryEngine in `@llamaindex/experimental`, as the code quality is not satisify and we will bring it back later
