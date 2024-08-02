# @llamaindex/core

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
