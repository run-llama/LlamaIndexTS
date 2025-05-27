# @llamaindex/google

## 0.3.4

### Patch Changes

- ae75966: Update Gemini model keys to reflect Google changes

## 0.3.3

### Patch Changes

- Updated dependencies [59601dd]
  - @llamaindex/core@0.6.7

## 0.3.2

### Patch Changes

- Updated dependencies [680b529]
- Updated dependencies [361a685]
  - @llamaindex/core@0.6.6

## 0.3.1

### Patch Changes

- 76c9a80: Make core package a peer dependency
- Updated dependencies [d671ed6]
  - @llamaindex/core@0.6.5

## 0.3.0

### Minor Changes

- 206b491: Add support for google live api

### Patch Changes

- 9b2e25a: Use Uint8Array instead of Buffer for file type messages (works with non-NodeJS)
- Updated dependencies [9b2e25a]
  - @llamaindex/core@0.6.4
  - @llamaindex/env@0.1.30

## 0.2.6

### Patch Changes

- 73e2578: Add support for gemini-2.5-pro-preview-05-06

## 0.2.5

### Patch Changes

- 3ee8c83: feat: support file content type in message content
- Updated dependencies [3ee8c83]
  - @llamaindex/core@0.6.3

## 0.2.4

### Patch Changes

- 96dac4d: Add Gemini 2.5 Flash Preview

## 0.2.3

### Patch Changes

- 0d852d6: Add the Gemini 2.5 Pro Preview model

## 0.2.2

### Patch Changes

- 9c63f3f: Add support for openai responses api
- Updated dependencies [9c63f3f]
  - @llamaindex/core@0.6.2

## 0.2.1

### Patch Changes

- Updated dependencies [1b6f368]
- Updated dependencies [eaf326e]
  - @llamaindex/core@0.6.1

## 0.2.0

### Minor Changes

- 91a18e7: Added support for structured output in the chat api of openai and ollama
  Added structured output parameter in the provider

### Patch Changes

- da06e45: fix: don't ignore parts that only have inline data for google studio
- 2a0a899: Added saftey setting parameter for gemini
- 3fd4cc3: feat: use google's new gen ai library to support multimodal output
- Updated dependencies [21bebfc]
- Updated dependencies [93bc0ff]
- Updated dependencies [91a18e7]
- Updated dependencies [5189b44]
  - @llamaindex/core@0.6.0

## 0.1.2

### Patch Changes

- 98eebf7: Add RequestOptions parameter passing to support Gemini proxy calls.
  Add a usage example for the RequestOptions parameter.

## 0.1.1

### Patch Changes

- 33f9856: Fix google start chat tools parameter
- aea550a: Add factory convenience factory for each LLM provider, e.g. you can use openai instead of 'new OpenAI'
- Updated dependencies [40ee761]
  - @llamaindex/core@0.5.8

## 0.1.0

### Minor Changes

- 58b3ee5: google vertex ai don't support empty functionDeclarations array. You must pass an empty array to LLMAgent if you don't have tools so Gemini was no able to use it in agent mode. Also Gemini 2.0 flash lite was added to model list.

### Patch Changes

- Updated dependencies [4bac71d]
  - @llamaindex/core@0.5.7

## 0.0.14

### Patch Changes

- 7ee4968: Add Gemini 2.0 Pro Experimental

## 0.0.13

### Patch Changes

- Updated dependencies [beb922b]
  - @llamaindex/env@0.1.29
  - @llamaindex/core@0.5.6

## 0.0.12

### Patch Changes

- Updated dependencies [5668970]
  - @llamaindex/core@0.5.5

## 0.0.11

### Patch Changes

- Updated dependencies [ad3c7f1]
  - @llamaindex/core@0.5.4

## 0.0.10

### Patch Changes

- Updated dependencies [cb021e7]
  - @llamaindex/core@0.5.3

## 0.0.9

### Patch Changes

- Updated dependencies [d952e68]
  - @llamaindex/core@0.5.2

## 0.0.8

### Patch Changes

- Updated dependencies [cc50c9c]
  - @llamaindex/env@0.1.28
  - @llamaindex/core@0.5.1

## 0.0.7

### Patch Changes

- Updated dependencies [6a4a737]
- Updated dependencies [d924c63]
  - @llamaindex/core@0.5.0

## 0.0.6

### Patch Changes

- 1c908fd: Revert previous release (not working with CJS)
- Updated dependencies [1c908fd]
  - @llamaindex/core@0.4.23
  - @llamaindex/env@0.1.27

## 0.0.5

### Patch Changes

- cb608b5: fix: bundle output incorrect
- Updated dependencies [cb608b5]
  - @llamaindex/core@0.4.22
  - @llamaindex/env@0.1.26

## 0.0.4

### Patch Changes

- b6ea2bf: fix(gemini): use function role for message contains tool-result

## 0.0.3

### Patch Changes

- e38e474: Add Gemini 2.0 models

## 0.0.2

### Patch Changes

- 4df1fe6: chore: migrate llamaindex llms and embeddings to their own packages
- Updated dependencies [9456616]
- Updated dependencies [1931bbc]
  - @llamaindex/core@0.4.21
