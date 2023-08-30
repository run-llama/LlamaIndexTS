# llamaindex

## 0.0.25

### Patch Changes

- e21eca2: OpenAI 4.3.1 and Anthropic 0.6.2
- 40a8f07: Update READMEs (thanks @andfk)
- 40a8f07: Bug: missing exports from storage (thanks @aashutoshrathi)

## 0.0.24

### Patch Changes

- e4af7b3: Renamed ListIndex to SummaryIndex to better indicate its use.
- 259fe63: Strong types for prompts.

## 0.0.23

### Patch Changes

- Added MetadataMode to ResponseSynthesizer (thanks @TomPenguin)
- 9d6b2ed: Added Markdown Reader (huge shoutout to @swk777)

## 0.0.22

### Patch Changes

- 454f3f8: CJK sentence splitting (thanks @TomPenguin)
- 454f3f8: Export options for Windows formatted text files
- 454f3f8: Disable long sentence splitting by default
- 454f3f8: Make sentence splitter not split on decimals.
- 99df58f: Anthropic 0.6.1 and OpenAI 4.2.0. Changed Anthropic timeout back to 60s

## 0.0.21

### Patch Changes

- f7a57ca: Fixed metadata deserialization (thanks @marcagve)
- 0a09de2: Update to OpenAI 4.1.0
- f7a57ca: ChatGPT optimized prompts (thanks @LoganMarkewich)

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
