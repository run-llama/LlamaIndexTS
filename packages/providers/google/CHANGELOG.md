# @llamaindex/google

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
