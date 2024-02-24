# llamaindex

## 0.1.15

### Patch Changes

- 3a6e287: build: improve tree-shake & reduce unused package import

## 0.1.14

### Patch Changes

- 7416a87: build: cjs file not found
- Updated dependencies [7416a87]
  - @llamaindex/env@0.0.2

## 0.1.13

### Patch Changes

- b8be4c0: build: use ESM as default
- 65d8346: feat: abstract `@llamaindex/env` package

## 0.1.12

### Patch Changes

- a5e4e6d: Add using a managed index from LlamaCloud
- cfdd6db: fix: update pinecone vector store
- 59f9fb6: Add Fireworks to LlamaIndex
- 95add73: feat: multi-document agent

## 0.1.11

### Patch Changes

- 255ae7d: chore: update example (perfoms better with default model)
- cf3b757: feat: add filtering of metadata to PGVectorStore
- ee9f3f3: chore: refactor openai agent utils
- e78e9f4: feat(reranker): cohere reranker
- f205358: feat: markdown node parser
- dd05413: feat: use batching in vector store index
- 383933a: Add reader for LlamaParse

## 0.1.10

### Patch Changes

- b6c1500: feat(embedBatchSize): add batching for embeddings
- 6cc3a36: fix: update `VectorIndexRetriever` constructor parameters' type.
- cd82947: feat(queryEngineTool): add query engine tool to agents

## 0.1.9

### Patch Changes

- 09464e6: add OpenAIAgent (thanks @EmanuelCampos)

## 0.1.8

### Patch Changes

- d903da6: easier prompt customization for SimpleResponseBuilder
- ab9d941: fix(cyclic): remove cyclic structures from transform hash
- 177b446: chore: improve extractors prompt

## 0.1.7

### Patch Changes

- d687c11: feat(router): add router query engine

## 0.1.6

### Patch Changes

- cf44640: fix: `instanceof` issue

  This will fix QueryEngine cannot run.

- 7231ddb: feat: allow `SimpleDirectoryReader` to get a string

## 0.1.5

### Patch Changes

- 8a9b78a: chore: split readers into different files

## 0.1.4

### Patch Changes

- 88696e1: refactor: use `pdf2json` instead of `pdfjs-dist`

  Please add `pdf2json` to `serverComponentsExternalPackages` if you have to parse pdf in runtime.

  ```js
  // next.config.js
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ["pdf2json"],
    },
  };

  module.exports = nextConfig;
  ```

## 0.1.3

### Patch Changes

- 9ce7d3d: update dependencies
- 7d50196: fix: output target causes not implemented error

## 0.1.2

- e4b807a: fix: invalid package.json

## 0.1.1

No changes for this release.

## 0.1.0

### Minor Changes

- 3154f52: chore: add qdrant readme

### Patch Changes

- bb66cb7: add new OpenAI embeddings (with dimension reduction support)

## 0.0.51

### Patch Changes

- fda8024: revert: export conditions not working with moduleResolution `node`

## 0.0.50

### Patch Changes

- 8a729cd: fix bugs in Together.AI integration (thanks @Nutlope for reporting)

## 0.0.49

### Patch Changes

- eee3922: feat(qdrant): Add Qdrant Vector DB
- e2790da: Preview: Add ingestion pipeline (incl. different strategies to handle doc store duplicates)
- bff40f2: feat: use conditional exports

  The benefit of conditional exports is we split the llamaindex into different files. This will improve the tree shake if you are building web apps.

  This also requires node16 (see https://nodejs.org/api/packages.html#conditional-exports).

  If you are seeing typescript issue `TS2724`('llamaindex' has no exported member named XXX):

  1. update `moduleResolution` to `bundler` in `tsconfig.json`, more for the web applications like Next.js, and vite, but still works for ts-node or tsx.
  2. consider the ES module in your project, add `"type": "module"` into `package.json` and update `moduleResolution` to `node16` or `nodenext` in `tsconfig.json`.

  We still support both cjs and esm, but you should update `tsconfig.json` to make the typescript happy.

- 2d8845b: feat(extractors): add keyword extractor and base extractor

## 0.0.48

### Patch Changes

- 34a26e5: Remove HistoryChatEngine and use ChatHistory for all chat engines

## 0.0.47

### Patch Changes

- 844029d: Add streaming support for QueryEngine (and unify streaming interface with ChatEngine)
- 844029d: Breaking: Use parameter object for query and chat methods of ChatEngine and QueryEngine

## 0.0.46

### Patch Changes

- 977f284: fixing import statement
- 5d3bb66: fix: class SimpleKVStore might throw error in ES module
- f18c9f6: refactor: Updated low-level streaming interface

## 0.0.45

### Patch Changes

- 2e6b36e: feat: support together AI

## 0.0.44

### Patch Changes

- 648482b: Feat: Add support for Chroma DB as a vector store

## 0.0.43

### Patch Changes

- Fix performance issue parsing nodes: use regex to split texts

## 0.0.42

### Patch Changes

- 16f04c7: Add local embeddings using hugging face
- 16f04c7: Add sentence window retrieval

## 0.0.41

### Patch Changes

- c835f78: Use compromise as sentence tokenizer
- c835f78: Removed pdf-parse, and directly use latest pdf.js
- c835f78: Added pinecone vector DB
- c835f78: Added support for Ollama

## 0.0.40

### Patch Changes

- e9f6de1: Added support for multi-modal RAG (retriever and query engine) incl. an example
  Fixed persisting and loading image vector stores
- 606ffa4: Updated Astra client and added associated type changes

## 0.0.39

### Patch Changes

- 21510bd: Added support for MistralAI (LLM and Embeddings)
- 25141b8: Add support for AstraDB vector store

## 0.0.38

### Patch Changes

- 786c25d: Fixes to the PGVectorStore (thanks @mtutty)
- bf9e263: Azure bugfix (thanks @parhammmm)
- bf9e263: AssemblyAI updates (thanks @Swimburger)
- 786c25d: Add GPT-4 Vision support (thanks @marcusschiesser)
- bf9e263: Internationalization of docs (thanks @hexapode and @disiok)

## 0.0.37

### Patch Changes

- 3bab231: Fixed errors (#225 and #226) Thanks @marcusschiesser

## 0.0.36

### Patch Changes

- Support for Claude 2.1
- Add AssemblyAI integration (thanks @Swimburger)
- Use cryptoJS (thanks @marcusschiesser)
- Add PGVectorStore (thanks @mtutty)
- Add CLIP embeddings (thanks @marcusschiesser)
- Add MongoDB support (thanks @marcusschiesser)

## 0.0.35

### Patch Changes

- 63f2108: Add multimodal support (thanks @marcusschiesser)

## 0.0.34

### Patch Changes

- 2a27e21: Add support for gpt-3.5-turbo-1106

## 0.0.33

### Patch Changes

- 5e2e92c: gpt-4-1106-preview and gpt-4-vision-preview from OpenAI dev day

## 0.0.32

### Patch Changes

- 90c0b83: Add HTMLReader (thanks @mtutty)
- dfd22aa: Add observer/filter to the SimpleDirectoryReader (thanks @mtutty)

## 0.0.31

### Patch Changes

- 6c55b2d: Give HistoryChatEngine pluggable options (thanks @marcusschiesser)
- 8aa8c65: Add SimilarityPostProcessor (thanks @TomPenguin)
- 6c55b2d: Added LLMMetadata (thanks @marcusschiesser)

## 0.0.30

### Patch Changes

- 139abad: Streaming improvements including Anthropic (thanks @kkang2097)
- 139abad: Portkey integration (Thank you @noble-varghese)
- eb0e994: Add export for PromptHelper (thanks @zigamall)
- eb0e994: Publish ESM module again
- 139abad: Pinecone demo (thanks @Einsenhorn)

## 0.0.29

### Patch Changes

- a52143b: Added DocxReader for Word documents (thanks @jayantasamaddar)
- 1b7fd95: Updated OpenAI streaming (thanks @kkang2097)
- 0db3f41: Migrated to Tiktoken lite, which hopefully fixes the Windows issue

## 0.0.28

### Patch Changes

- 96bb657: Typesafe metadata (thanks @TomPenguin)
- 96bb657: MongoReader (thanks @kkang2097)
- 837854d: Make OutputParser less strict and add tests (Thanks @kkang2097)

## 0.0.27

### Patch Changes

- 4a5591b: Chat History summarization (thanks @marcusschiesser)
- 4a5591b: Notion database support (thanks @TomPenguin)
- 4a5591b: KeywordIndex (thanks @swk777)

## 0.0.26

### Patch Changes

- 5bb55bc: Add notion loader (thank you @TomPenguin!)

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
