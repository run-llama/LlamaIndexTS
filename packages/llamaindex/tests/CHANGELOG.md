# @llamaindex/core-test

## 0.1.23

### Patch Changes

- Updated dependencies [76709c2]
  - @llamaindex/openai@0.4.22

## 0.1.22

### Patch Changes

- Updated dependencies [1028877]
  - @llamaindex/openai@0.4.21

## 0.1.21

### Patch Changes

- @llamaindex/openai@0.4.20

## 0.1.20

### Patch Changes

- 8929dcf: feat: vectorStoreIndex has new option progressCallback
- Updated dependencies [5da1cda]
  - @llamaindex/openai@0.4.19

## 0.1.19

### Patch Changes

- Updated dependencies [001a515]
- Updated dependencies [9d7d205]
  - @llamaindex/openai@0.4.18

## 0.1.18

### Patch Changes

- @llamaindex/openai@0.4.17

## 0.1.17

### Patch Changes

- Updated dependencies [4c70376]
  - @llamaindex/openai@0.4.16

## 0.1.16

### Patch Changes

- Updated dependencies [b6409b6]
  - @llamaindex/openai@0.4.15

## 0.1.15

### Patch Changes

- @llamaindex/openai@0.4.14

## 0.1.14

### Patch Changes

- @llamaindex/openai@0.4.13

## 0.1.13

### Patch Changes

- @llamaindex/openai@0.4.12

## 0.1.12

### Patch Changes

- @llamaindex/openai@0.4.11

## 0.1.11

### Patch Changes

- Updated dependencies [856dd8c]
  - @llamaindex/openai@0.4.10

## 0.1.10

### Patch Changes

- Updated dependencies [a1fdb07]
  - @llamaindex/openai@0.4.9

## 0.1.9

### Patch Changes

- @llamaindex/openai@0.4.8

## 0.1.8

### Patch Changes

- @llamaindex/openai@0.4.7

## 0.1.7

### Patch Changes

- @llamaindex/openai@0.4.6

## 0.1.6

### Patch Changes

- Updated dependencies [d8ac8d3]
  - @llamaindex/openai@0.4.5

## 0.1.5

### Patch Changes

- @llamaindex/openai@0.4.4

## 0.1.4

### Patch Changes

- @llamaindex/openai@0.4.3

## 0.1.3

### Patch Changes

- Updated dependencies [c927457]
  - @llamaindex/openai@0.4.2

## 0.1.2

### Patch Changes

- Updated dependencies [59601dd]
  - @llamaindex/openai@0.4.1

## 0.1.1

### Patch Changes

- b0cd530: # Breaking Change

  ## What Changed

  Remove default setting of llm and embedModel in Settings

  ## Migration Guide

  Set the llm provider and embed Model in the top of your code using Settings.llm = and Settings.embedModel

- Updated dependencies [3e66ddc]
  - @llamaindex/openai@0.4.0

## 0.1.0

### Minor Changes

- 6a4a737: Remove re-exports from llamaindex main package

## 0.0.9

### Patch Changes

- 067a489: fix: missing condition to stringify tool input

## 0.0.8

### Patch Changes

- 34faf48: chore: move vector stores to their own packages
- 4df1fe6: chore: migrate llamaindex llms and embeddings to their own packages
- 1931bbc: refactor: @llamaindex/azure

## 0.0.7

### Patch Changes

- 01c184c: Add is_empty operator for filtering vector store

## 0.0.6

### Patch Changes

- 5d5716b: feat: add a reader for JSON data

## 0.0.5

### Patch Changes

- b974eea: Add support for Metadata filters

## 0.0.4

### Patch Changes

- e6d6576: chore: use `unpdf`

## 0.0.3

### Patch Changes

- be5df5b: fix: anthropic agent on multiple chat

## 0.0.2

### Patch Changes

- 484a710: - Add missing exports:
  - `IndexStructType`,
  - `IndexDict`,
  - `jsonToIndexStruct`,
  - `IndexList`,
  - `IndexStruct`
  - Fix `IndexDict.toJson()` method
