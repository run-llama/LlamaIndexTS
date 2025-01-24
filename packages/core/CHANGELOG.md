# @llamaindex/core

## 0.4.21

### Patch Changes

- 9456616: refactor: @llamaindex/postgres
- 1931bbc: refactor: @llamaindex/azure

## 0.4.20

### Patch Changes

- d211b7a: added support for tool calls with results in message history for athropic agent

## 0.4.19

### Patch Changes

- a9b5b99: feat: build api reference pages for new documentation site

## 0.4.18

### Patch Changes

- e0f6cc3: The compact and refine response synthesizer (retrieved by using `getResponseSynthesizer('compact')`) has been fixed to return the original source nodes that were provided to it in its response. Previous to this it was returning the compacted text chunk documents.
- Updated dependencies [b504303]
  - @llamaindex/env@0.1.25

## 0.4.17

### Patch Changes

- 3d1808b: chore: bump version

## 0.4.16

### Patch Changes

- 8be4589: chore: bump version
- Updated dependencies [8be4589]
  - @llamaindex/env@0.1.24

## 0.4.15

### Patch Changes

- Updated dependencies [d2b2722]
  - @llamaindex/env@0.1.23

## 0.4.14

### Patch Changes

- Updated dependencies [969365c]
  - @llamaindex/env@0.1.22

## 0.4.13

### Patch Changes

- 90d265c: chore: bump version
- Updated dependencies [90d265c]
  - @llamaindex/env@0.1.21

## 0.4.12

### Patch Changes

- ef4f63d: refactor: move mockLLM to core

## 0.4.11

### Patch Changes

- 6d22fa2: Get PromptTemplate template variables at run-time

## 0.4.10

### Patch Changes

- a7b0ac3: fix: update tool call llm type
- c69605f: feat: add async support to BaseChatStore and BaseChatStoreMemory

## 0.4.9

### Patch Changes

- 7ae6eaa: feat: allow pass `additionalChatOptions` to agent

## 0.4.8

### Patch Changes

- f865c98: feat: async get message on chat store

## 0.4.7

### Patch Changes

- d89ebe0: feat: better support for zod schema
- fd8c882: chore: add warning on legacy workflow API

## 0.4.6

### Patch Changes

- Updated dependencies [4fc001c]
  - @llamaindex/env@0.1.20

## 0.4.5

### Patch Changes

- ad85bd0: - fix agent chat message not saved into the task context when streaming
  - fix async local storage might use `node:async_hook` in edge-light/workerd condition
- Updated dependencies [ad85bd0]
  - @llamaindex/env@0.1.19

## 0.4.4

### Patch Changes

- Updated dependencies [a8d3fa6]
  - @llamaindex/env@0.1.18

## 0.4.3

### Patch Changes

- 95a5cc6: refactor: move storage into core

## 0.4.2

### Patch Changes

- Updated dependencies [14cc9eb]
  - @llamaindex/env@0.1.17

## 0.4.1

### Patch Changes

- 9c73f0a: fix: async local storage in `Setting.with` API

## 0.4.0

### Minor Changes

- 98ba1e7: fea:t implement context-aware agent

### Patch Changes

- 359fd33: refactor(core): move `ContextChatEngine` and `SimpleChatEngine`
- efb7e1b: refactor: move `RetrieverQueryEngine` into core module
- 620c63c: feat: add `@llamaindex/readers` package

  If you are using import `llamaindex/readers/...`,
  you will need to install `@llamaindex/core` and change import path to `@llamaindex/readers/...`.

## 0.3.7

### Patch Changes

- 60b185f: fix: source nodes is empty

## 0.3.6

### Patch Changes

- 691c5bc: fix: export embeddings utils

## 0.3.5

### Patch Changes

- Updated dependencies [fa60fc6]
  - @llamaindex/env@0.1.16

## 0.3.4

### Patch Changes

- e2a0876: Remove chunk size limit for prompt helper (use LLM default)

## 0.3.3

### Patch Changes

- 0493f67: fix(core): inline `python-format-js`

## 0.3.2

### Patch Changes

- Updated dependencies [4ba2cfe]
  - @llamaindex/env@0.1.15

## 0.3.1

### Patch Changes

- a75af83: refactor: move some llm and embedding to single package
- Updated dependencies [ae49ff4]
- Updated dependencies [a75af83]
  - @llamaindex/env@0.1.14

## 0.3.0

### Minor Changes

- 1364e8e: update metadata extractors to use PromptTemplate
- 96fc69c: add defaultQuestionExtractPrompt

## 0.2.12

### Patch Changes

- 5f67820: Fix that node parsers generate nodes with UUIDs

## 0.2.11

### Patch Changes

- ee697fb: fix: generate uuid when inserting to Qdrant

## 0.2.10

### Patch Changes

- 3489e7d: fix: num output incorrect in prompt helper
- 468bda5: fix: correct warning when chunk size smaller than 0

## 0.2.9

### Patch Changes

- b17d439: Fix #1278: resolved issue where the id\_ was not correctly passed as the id when creating a TextNode. As a result, the upsert operation to the vector database was using a generated ID instead of the provided document ID, if available.

## 0.2.8

### Patch Changes

- df441e2: fix: consoleLogger is missing from `@llamaindex/env`
- Updated dependencies [df441e2]
  - @llamaindex/env@0.1.13

## 0.2.7

### Patch Changes

- 6cce3b1: feat: support `npm:postgres`

## 0.2.6

### Patch Changes

- 8b7fdba: refactor: move chat engine & retriever into core.

  - `chatHistory` in BaseChatEngine now returns `ChatMessage[] | Promise<ChatMessage[]>`, instead of `BaseMemory`
  - update `retrieve-end` type

## 0.2.5

### Patch Changes

- d902cc3: Fix context not being sent using ContextChatEngine

## 0.2.4

### Patch Changes

- b48bcc3: feat: add `load-transformers` event type when loading `@xenova/transformers` module

  This would benefit user who want to customize the transformer env.

- Updated dependencies [b48bcc3]
  - @llamaindex/env@0.1.12

## 0.2.3

### Patch Changes

- 2cd1383: refactor: align `response-synthesizers` & `chat-engine` module

  - builtin event system
  - correct class extends
  - aligin APIs, naming with llama-index python
  - move stream out of first parameter to second parameter for the better tyep checking
  - remove JSONQueryEngine in `@llamaindex/experimental`, as the code quality is not satisify and we will bring it back later

## 0.2.2

### Patch Changes

- 749b43a: fix: clip embedding transform function

## 0.2.1

### Patch Changes

- ac07e3c: fix: replace instanceof check with `.type` check
- 70ccb4a: Allow arbitrary types in workflow's StartEvent and StopEvent
- ac07e3c: fix: add `console.warn` when import dual module
- Updated dependencies [ac07e3c]
- Updated dependencies [1a6137b]
- Updated dependencies [ac07e3c]
  - @llamaindex/env@0.1.11

## 0.2.0

### Minor Changes

- 11feef8: Add workflows

## 0.1.12

### Patch Changes

- 711c814: fix: patch `python-format-js`

## 0.1.11

### Patch Changes

- Updated dependencies [4648da6]
  - @llamaindex/env@0.1.10

## 0.1.10

### Patch Changes

- 0148354: refactor: prompt system

  Add `PromptTemplate` module with strong type check.

## 0.1.9

### Patch Changes

- e27e7dd: chore: bump `natural` to 8.0.1

## 0.1.8

### Patch Changes

- 58abc57: fix: align version
- Updated dependencies [58abc57]
  - @llamaindex/env@0.1.9

## 0.1.7

### Patch Changes

- 04b2f8e: Fix issue with metadata included after sentence splitter

## 0.1.6

### Patch Changes

- 0452af9: fix: handling errors in splitBySentenceTokenizer

## 0.1.5

### Patch Changes

- 91d02a4: feat: support transform component callable

## 0.1.4

### Patch Changes

- 15962b3: feat: node parser refactor

  Align the text splitter logic with Python; it has almost the same logic as Python; Zod checks for input and better error messages and event system.

  This change will not be considered a breaking change since it doesn't have a significant output difference from the last version,
  but some edge cases will change, like the page separator and parameter for the constructor.

## 0.1.3

### Patch Changes

- 6cf6ae6: feat: abstract query type

## 0.1.2

### Patch Changes

- b974eea: Add support for Metadata filters

## 0.1.1

### Patch Changes

- b3681bf: fix: DataCloneError when using FunctionTool

## 0.1.0

### Minor Changes

- 16ef5dd: refactor: simplify callback manager

  Change `event.detail.payload` to `event.detail`

### Patch Changes

- 16ef5dd: refactor: move callback manager & llm to core module

  For people who import `llamaindex/llms/base` or `llamaindex/llms/utils`,
  use `@llamaindex/core/llms` and `@llamaindex/core/utils` instead.

## 0.0.3

### Patch Changes

- f326ab8: chore: bump version
- Updated dependencies [f326ab8]
  - @llamaindex/env@0.1.8

## 0.0.2

### Patch Changes

- f10b41d: fix: release files
- Updated dependencies [41fe871]
  - @llamaindex/env@0.1.7
