# llamaindex

## 0.3.14

### Patch Changes

- 6ff7576: Added GPT-4o for Azure
- 94543de: Added the latest preview gemini models and multi modal images taken into account

## 0.3.13

### Patch Changes

- 1b1081b: Add vectorStores to storage context to define vector store per modality
- 37525df: Added support for accessing Gemini via Vertex AI
- 660a2b3: Fix text before heading in markdown reader
- a1f2475: Add system prompt to ContextChatEngine

## 0.3.12

### Patch Changes

- 34fb1d8: fix: cloudflare dev

## 0.3.11

### Patch Changes

- e072c45: fix: remove non-standard API `pipeline`
- 9e133ac: refactor: remove `defaultFS` from parameters

  We don't accept passing fs in the parameter since it's unnecessary for a determined JS environment.

  This was a polyfill way for the non-Node.js environment, but now we use another way to polyfill APIs.

- 447105a: Improve Gemini message and context preparation
- 320be3f: Force ChromaDB version to 1.7.3 (to prevent NextJS issues)
- Updated dependencies [e072c45]
- Updated dependencies [9e133ac]
  - @llamaindex/env@0.1.3

## 0.3.10

### Patch Changes

- 4aba02e: feat: support gpt4-o

## 0.3.9

### Patch Changes

- c3747d0: fix: import `@xenova/transformers`

  For now, if you use llamaindex in next.js, you need to add a plugin from `llamaindex/next` to ensure some module resolutions are correct.

## 0.3.8

### Patch Changes

- ce94780: Add page number to read PDFs and use generated IDs for PDF and markdown content

## 0.3.7

### Patch Changes

- b6a6606: feat: allow change host of ollama
- b6a6606: chore: export ollama in default js runtime

## 0.3.6

### Patch Changes

- efa326a: chore: update package.json
- Updated dependencies [efa326a]
- Updated dependencies [efa326a]
  - @llamaindex/env@0.1.2

## 0.3.5

### Patch Changes

- bc7a11c: fix: inline ollama build
- 2fe2b81: fix: filter with multiple filters in ChromaDB
- 5596e31: feat: improve `@llamaindex/env`
- e74fe88: fix: change <-> to <=> in the SELECT query
- be5df5b: fix: anthropic agent on multiple chat
- Updated dependencies [5596e31]
  - @llamaindex/env@0.1.1

## 0.3.4

### Patch Changes

- 1dce275: fix: export `StorageContext` on edge runtime
- d10533e: feat: add hugging face llm
- 2008efe: feat: add verbose mode to Agent
- 5e61934: fix: remove clone object in `CallbackManager.dispatchEvent`
- 9e74a43: feat: add top k to `asQueryEngine`
- ee719a1: fix: streaming for ReAct Agent

## 0.3.3

### Patch Changes

- e8c41c5: fix: wrong gemini streaming chat response

## 0.3.2

### Patch Changes

- 61103b6: fix: streaming for `Agent.createTask` API

## 0.3.1

### Patch Changes

- 46227f2: fix: build error on next.js nodejs runtime

## 0.3.0

### Minor Changes

- 5016f21: feat: improve next.js/cloudflare/vite support

### Patch Changes

- Updated dependencies [5016f21]
  - @llamaindex/env@0.1.0

## 0.2.13

### Patch Changes

- 6277105: fix: allow passing empty tools to llms

## 0.2.12

### Patch Changes

- d8d952d: feat: add gemini llm and embedding

## 0.2.11

### Patch Changes

- 87142b2: refactor: use ollama official sdk
- 5a6cc0e: feat: support jina ai embedding and reranker
- 87142b2: feat: support output to json format

## 0.2.10

### Patch Changes

- cf70edb: Llama 3 support

## 0.2.9

### Patch Changes

- 76c3fd6: Add score to source nodes response
- 208282d: feat: init anthropic agent

  remove the `tool` | `function` type in `MessageType`. Replace with `assistant` instead.
  This is because these two types are only available for `OpenAI`.
  Since `OpenAI` deprecates the function type, we support the Claude 3 tool call.

## 0.2.8

### Patch Changes

- Add ToolsFactory to generate agent tools

## 0.2.7

### Patch Changes

- 96f8f40: fix: agent stream
- Updated dependencies
  - @llamaindex/env@0.0.7

## 0.2.6

### Patch Changes

- a3b4409: Fix agent streaming with new OpenAI models

## 0.2.5

### Patch Changes

- 7d56cdf: Allow OpenAIAgent to be called without tools

## 0.2.4

### Patch Changes

- 3bc77f7: gpt-4-turbo GA
- 8d2b21e: Mistral 0.1.3

## 0.2.3

### Patch Changes

- f0704ec: Support streaming for OpenAI agent (and OpenAI tool calls)
- Removed 'parentEvent' - Use 'event.reason?.computedCallers' instead
- 3cbfa98: Added LlamaCloudIndex.fromDocuments

## 0.2.2

### Patch Changes

- 3f8407c: Add pipeline.register to create a managed index in LlamaCloud
- 60a1603: fix: make edge run build after core
- fececd8: feat: add tool factory
- 1115f83: fix: throw error when no pipelines exist for the retriever
- 7a23cc6: feat: improve CallbackManager
- ea467fa: Update the list of supported Azure OpenAI API versions as of 2024-04-02.
- 6d9e015: feat: use claude3 with react agent
- 0b665bd: feat: add wikipedia tool
- 24b4033: feat: add result type json
- 8b28092: Add support for doc store strategies to VectorStoreIndex.fromDocuments
- Updated dependencies [7a23cc6]
  - @llamaindex/env@0.0.6

## 0.2.1

### Patch Changes

- 41210df: Add auto create milvus collection and add milvus node metadata
- 137cf67: Use Pinecone namespaces for all operations
- 259c842: Add support for edge runtime by using @llamaindex/edge

## 0.2.0

### Minor Changes

- bf583a7: Use parameter object for retrieve function of Retriever (to align usage with query function of QueryEngine)

### Patch Changes

- d2e8d0c: add support for Milvus vector store
- aefc326: feat: experimental package + json query engine
- 484a710: - Add missing exports:
  - `IndexStructType`,
  - `IndexDict`,
  - `jsonToIndexStruct`,
  - `IndexList`,
  - `IndexStruct`
  - Fix `IndexDict.toJson()` method
- d766bd0: Add streaming to agents
- dd95927: add Claude Haiku support and update anthropic SDK

## 0.1.21

### Patch Changes

- 552a61a: Add quantized parameter to HuggingFaceEmbedding
- d824876: Add support for Claude 3

## 0.1.20

### Patch Changes

- 64683a5: fix: prefix messages always true
- 698cd9c: fix: step wise agent + examples
- 7257751: fixed removeRefDocNode and persist store on delete
- 5116ad8: fix: compatibility issue with Deno
- Updated dependencies [5116ad8]
  - @llamaindex/env@0.0.5

## 0.1.19

### Patch Changes

- 026d068: feat: enhance pinecone usage

## 0.1.18

### Patch Changes

- 90027a7: Add splitLongSentences option to SimpleNodeParser
- c57bd11: feat: update and refactor title extractor

## 0.1.17

### Patch Changes

- c8396c5: feat: add base evaluator and correctness evaluator
- c8396c5: feat: add base evaluator and correctness evaluator
- cf87f84: fix: type backward compatibility
- 09bf27a: Add Groq LLM to LlamaIndex
- Updated dependencies [cf87f84]
  - @llamaindex/env@0.0.4

## 0.1.16

### Patch Changes

- e8e21a0: build: set files in package.json
- Updated dependencies [e8e21a0]
  - @llamaindex/env@0.0.3

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
