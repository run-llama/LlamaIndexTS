# llamaindex

## 0.0.20

### Patch Changes

- b526a2d: added additionalSessionOptions and additionalChatOptions
- b526a2d: OpenAI v4.0.1
- b526a2d: OpenAI moved timeout back to 60 seconds

## 0.0.19

### Patch Changes

- a747f28: Add PapaCSVReader (thank you @swk777)
- 355910b: OpenAI v4 (final), Anthropic 0.6, Replicate 0.16.1
- 355910b: Breaking: Removed NodeWithEmbeddings (just use BaseNode)

## 0.0.18

### Patch Changes

- 824c13c: Breaking: allow documents to be reimported with hash checking.
- 18b8915: Update storage exports (thanks @TomPenguin)
- ade9d8f: Bug fix: use session in OpenAI Embeddings (thanks @swk777)
- 824c13c: Breaking: removed nodeId and docId. Just use id\_

## 0.0.17

### Patch Changes

- f80b062: Breaking: changed default temp to 0.1 matching new Python change by @logan-markewich
- b3fec86: Add support for new Replicate 4 bit Llama2 models
- b3fec86: Bug fixes for Llama2 Replicate

## 0.0.16

### Patch Changes

- ec12633: Breaking: make vector store abstraction async (thank you @tyre for the PR)
- 9214b06: Fix persistence bug (thanks @HenryHengZJ)
- 3e52972: Fix Node initializer bug (thank you @tyre for the PR)
- 3316c6b: Add Azure OpenAI support
- 3316c6b: OpenAI Node v4-beta.8

## 0.0.15

### Patch Changes

- b501eb5: Added Anthropic Claude support
- f9d1a6e: Add Top P

## 0.0.14

### Patch Changes

- 4ef334a: JSDoc and Github Actions thanks to @kevinlu1248, @sweep-ai
- 0af7773: Added Meta strategy for Llama2
- bea4af9: Fixed sentence splitter overlap logic
- 4ef334a: asQueryEngine bug fix from @ysak-y

## 0.0.13

### Patch Changes

- 4f6f245: Moved to OpenAI NPM v4

## 0.0.12

### Patch Changes

- 68bdaaa: Updated dependencies and README

## 0.0.11

### Patch Changes

- fb7fb76: Added back PDF loader

## 0.0.10

### Patch Changes

- 6f2cb31: Fixed tokenizer decoder

## 0.0.9

### Patch Changes

- 02d9bb0: Remove ESM export for now (causing issues with edge functions)

## 0.0.8

### Patch Changes

- ea5038e: Disabling PDF loader for now to fix module import

## 0.0.7

### Patch Changes

- 9fa6d4a: Make second argument of fromDocuments optional again

## 0.0.6

### Patch Changes

- Better persistence interface (thanks Logan)

## 0.0.5

### Patch Changes

- 5a765aa: Updated README

## 0.0.4

### Patch Changes

- c65d671: Added README and CONTRIBUTING

## 0.0.3

### Patch Changes

- ca9410f: Added more documentation

## 0.0.2

### Patch Changes

- Initial release
