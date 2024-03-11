---
id: "index"
title: "llamaindex"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Enumerations

- [ClipEmbeddingModelType](enums/ClipEmbeddingModelType.md)
- [DeuceChatStrategy](enums/DeuceChatStrategy.md)
- [IndexStructType](enums/IndexStructType.md)
- [KeywordTableRetrieverMode](enums/KeywordTableRetrieverMode.md)
- [MetadataMode](enums/MetadataMode.md)
- [NodeRelationship](enums/NodeRelationship.md)
- [ObjectType](enums/ObjectType.md)
- [OpenAIEmbeddingModelType](enums/OpenAIEmbeddingModelType.md)
- [SimilarityType](enums/SimilarityType.md)
- [SummaryRetrieverMode](enums/SummaryRetrieverMode.md)
- [Tokenizers](enums/Tokenizers.md)
- [VectorStoreQueryMode](enums/VectorStoreQueryMode.md)

## Classes

- [Anthropic](classes/Anthropic.md)
- [BaseDocumentStore](classes/BaseDocumentStore.md)
- [BaseEmbedding](classes/BaseEmbedding.md)
- [BaseInMemoryKVStore](classes/BaseInMemoryKVStore.md)
- [BaseIndex](classes/BaseIndex.md)
- [BaseIndexStore](classes/BaseIndexStore.md)
- [BaseKVStore](classes/BaseKVStore.md)
- [BaseNode](classes/BaseNode.md)
- [CallbackManager](classes/CallbackManager.md)
- [ClipEmbedding](classes/ClipEmbedding.md)
- [CompactAndRefine](classes/CompactAndRefine.md)
- [CondenseQuestionChatEngine](classes/CondenseQuestionChatEngine.md)
- [ContextChatEngine](classes/ContextChatEngine.md)
- [DefaultContextGenerator](classes/DefaultContextGenerator.md)
- [Document](classes/Document.md)
- [HTMLReader](classes/HTMLReader.md)
- [HistoryChatEngine](classes/HistoryChatEngine.md)
- [ImageDocument](classes/ImageDocument.md)
- [ImageNode](classes/ImageNode.md)
- [InMemoryFileSystem](classes/InMemoryFileSystem.md)
- [IndexDict](classes/IndexDict.md)
- [IndexList](classes/IndexList.md)
- [IndexNode](classes/IndexNode.md)
- [IndexStruct](classes/IndexStruct.md)
- [KeywordTable](classes/KeywordTable.md)
- [KeywordTableIndex](classes/KeywordTableIndex.md)
- [KeywordTableLLMRetriever](classes/KeywordTableLLMRetriever.md)
- [KeywordTableRAKERetriever](classes/KeywordTableRAKERetriever.md)
- [KeywordTableSimpleRetriever](classes/KeywordTableSimpleRetriever.md)
- [LLMQuestionGenerator](classes/LLMQuestionGenerator.md)
- [LlamaDeuce](classes/LlamaDeuce.md)
- [MarkdownReader](classes/MarkdownReader.md)
- [MongoDBAtlasVectorSearch](classes/MongoDBAtlasVectorSearch.md)
- [MultiModalEmbedding](classes/MultiModalEmbedding.md)
- [NotionReader](classes/NotionReader.md)
- [OpenAI](classes/OpenAI.md)
- [OpenAIEmbedding](classes/OpenAIEmbedding.md)
- [PDFReader](classes/PDFReader.md)
- [PapaCSVReader](classes/PapaCSVReader.md)
- [Portkey](classes/Portkey.md)
- [PromptHelper](classes/PromptHelper.md)
- [Refine](classes/Refine.md)
- [Response](classes/Response.md)
- [ResponseSynthesizer](classes/ResponseSynthesizer.md)
- [RetrieverQueryEngine](classes/RetrieverQueryEngine.md)
- [SentenceSplitter](classes/SentenceSplitter.md)
- [SimilarityPostprocessor](classes/SimilarityPostprocessor.md)
- [SimpleChatEngine](classes/SimpleChatEngine.md)
- [SimpleChatHistory](classes/SimpleChatHistory.md)
- [SimpleDirectoryReader](classes/SimpleDirectoryReader.md)
- [SimpleDocumentStore](classes/SimpleDocumentStore.md)
- [SimpleIndexStore](classes/SimpleIndexStore.md)
- [SimpleKVStore](classes/SimpleKVStore.md)
- [SimpleMongoReader](classes/SimpleMongoReader.md)
- [SimpleNodeParser](classes/SimpleNodeParser.md)
- [SimpleResponseBuilder](classes/SimpleResponseBuilder.md)
- [SimpleVectorStore](classes/SimpleVectorStore.md)
- [SubQuestionOutputParser](classes/SubQuestionOutputParser.md)
- [SubQuestionQueryEngine](classes/SubQuestionQueryEngine.md)
- [SummaryChatHistory](classes/SummaryChatHistory.md)
- [SummaryIndex](classes/SummaryIndex.md)
- [SummaryIndexLLMRetriever](classes/SummaryIndexLLMRetriever.md)
- [SummaryIndexRetriever](classes/SummaryIndexRetriever.md)
- [TextFileReader](classes/TextFileReader.md)
- [TextNode](classes/TextNode.md)
- [TreeSummarize](classes/TreeSummarize.md)
- [VectorIndexRetriever](classes/VectorIndexRetriever.md)
- [VectorStoreIndex](classes/VectorStoreIndex.md)

## Interfaces

- [BaseIndexInit](interfaces/BaseIndexInit.md)
- [BaseNodePostprocessor](interfaces/BaseNodePostprocessor.md)
- [BaseOutputParser](interfaces/BaseOutputParser.md)
- [BaseQueryEngine](interfaces/BaseQueryEngine.md)
- [BaseQuestionGenerator](interfaces/BaseQuestionGenerator.md)
- [BaseReader](interfaces/BaseReader.md)
- [BaseRetriever](interfaces/BaseRetriever.md)
- [BaseTool](interfaces/BaseTool.md)
- [ChatEngine](interfaces/ChatEngine.md)
- [ChatHistory](interfaces/ChatHistory.md)
- [ChatMessage](interfaces/ChatMessage.md)
- [ChatResponse](interfaces/ChatResponse.md)
- [Context](interfaces/Context.md)
- [ContextGenerator](interfaces/ContextGenerator.md)
- [DefaultStreamToken](interfaces/DefaultStreamToken.md)
- [Event](interfaces/Event.md)
- [ExactMatchFilter](interfaces/ExactMatchFilter.md)
- [GenericFileSystem](interfaces/GenericFileSystem.md)
- [LLM](interfaces/LLM.md)
- [LLMMetadata](interfaces/LLMMetadata.md)
- [MessageContentDetail](interfaces/MessageContentDetail.md)
- [MetadataFilters](interfaces/MetadataFilters.md)
- [MetadataInfo](interfaces/MetadataInfo.md)
- [NodeParser](interfaces/NodeParser.md)
- [NodeWithScore](interfaces/NodeWithScore.md)
- [QueryEngineTool](interfaces/QueryEngineTool.md)
- [RefDocInfo](interfaces/RefDocInfo.md)
- [RelatedNodeInfo](interfaces/RelatedNodeInfo.md)
- [RetrievalCallbackResponse](interfaces/RetrievalCallbackResponse.md)
- [ServiceContext](interfaces/ServiceContext.md)
- [ServiceContextOptions](interfaces/ServiceContextOptions.md)
- [StorageContext](interfaces/StorageContext.md)
- [StreamCallbackResponse](interfaces/StreamCallbackResponse.md)
- [StructuredOutput](interfaces/StructuredOutput.md)
- [SubQuestion](interfaces/SubQuestion.md)
- [ToolMetadata](interfaces/ToolMetadata.md)
- [VectorStore](interfaces/VectorStore.md)
- [VectorStoreInfo](interfaces/VectorStoreInfo.md)
- [VectorStoreQuery](interfaces/VectorStoreQuery.md)
- [VectorStoreQueryResult](interfaces/VectorStoreQueryResult.md)
- [VectorStoreQuerySpec](interfaces/VectorStoreQuerySpec.md)
- [WalkableFileSystem](interfaces/WalkableFileSystem.md)

## Type Aliases

### AnthropicStreamToken

Ƭ **AnthropicStreamToken**: `Object`

#### Type declaration

| Name          | Type                    |
| :------------ | :---------------------- |
| `completion`  | `string`                |
| `log_id?`     | `string`                |
| `model`       | `string`                |
| `stop?`       | `boolean`               |
| `stop_reason` | `string` \| `undefined` |

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/callbacks/CallbackManager.ts#L42)

---

### ChoiceSelectPrompt

Ƭ **ChoiceSelectPrompt**: typeof [`defaultChoiceSelectPrompt`](#defaultchoiceselectprompt)

#### Defined in

[packages/core/src/Prompt.ts:165](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L165)

---

### CompleteFileSystem

Ƭ **CompleteFileSystem**: [`GenericFileSystem`](interfaces/GenericFileSystem.md) & [`WalkableFileSystem`](interfaces/WalkableFileSystem.md)

#### Defined in

[packages/core/src/storage/FileSystem.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/FileSystem.ts#L49)

---

### CompletionResponse

Ƭ **CompletionResponse**: [`ChatResponse`](interfaces/ChatResponse.md)

#### Defined in

[packages/core/src/llm/LLM.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L51)

---

### CondenseQuestionPrompt

Ƭ **CondenseQuestionPrompt**: typeof [`defaultCondenseQuestionPrompt`](#defaultcondensequestionprompt)

#### Defined in

[packages/core/src/Prompt.ts:346](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L346)

---

### ContextSystemPrompt

Ƭ **ContextSystemPrompt**: typeof [`defaultContextSystemPrompt`](#defaultcontextsystemprompt)

#### Defined in

[packages/core/src/Prompt.ts:367](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L367)

---

### EventTag

Ƭ **EventTag**: `"intermediate"` \| `"final"`

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/callbacks/CallbackManager.ts#L10)

---

### EventType

Ƭ **EventType**: `"retrieve"` \| `"llmPredict"` \| `"wrapper"`

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/callbacks/CallbackManager.ts#L11)

---

### ImageNodeConstructorProps

Ƭ **ImageNodeConstructorProps**<`T`\>: `Pick`<[`ImageNode`](classes/ImageNode.md)<`T`\>, `"image"` \| `"id_"`\> & `Partial`<[`ImageNode`](classes/ImageNode.md)<`T`\>\>

#### Type parameters

| Name | Type                            |
| :--- | :------------------------------ |
| `T`  | extends [`Metadata`](#metadata) |

#### Defined in

[packages/core/src/Node.ts:290](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Node.ts#L290)

---

### ImageType

Ƭ **ImageType**: `string` \| `Blob` \| `URL`

#### Defined in

[packages/core/src/Node.ts:288](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Node.ts#L288)

---

### KeywordExtractPrompt

Ƭ **KeywordExtractPrompt**: typeof [`defaultKeywordExtractPrompt`](#defaultkeywordextractprompt)

#### Defined in

[packages/core/src/Prompt.ts:382](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L382)

---

### ListIndex

Ƭ **ListIndex**: [`SummaryIndex`](classes/SummaryIndex.md)

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:264](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndex.ts#L264)

---

### ListIndexLLMRetriever

Ƭ **ListIndexLLMRetriever**: [`SummaryIndexLLMRetriever`](classes/SummaryIndexLLMRetriever.md)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L134)

---

### ListIndexRetriever

Ƭ **ListIndexRetriever**: [`SummaryIndexRetriever`](classes/SummaryIndexRetriever.md)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:133](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L133)

---

### ListRetrieverMode

Ƭ **ListRetrieverMode**: [`SummaryRetrieverMode`](enums/SummaryRetrieverMode.md)

#### Defined in

[packages/core/src/indices/summary/SummaryIndex.ts:265](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndex.ts#L265)

---

### MessageContent

Ƭ **MessageContent**: `string` \| [`MessageContentDetail`](interfaces/MessageContentDetail.md)[]

Extended type for the content of a message that allows for multi-modal messages.

#### Defined in

[packages/core/src/ChatEngine.ts:350](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L350)

---

### MessageType

Ƭ **MessageType**: `"user"` \| `"assistant"` \| `"system"` \| `"generic"` \| `"function"` \| `"memory"`

#### Defined in

[packages/core/src/llm/LLM.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L31)

---

### Metadata

Ƭ **Metadata**: `Record`<`string`, `any`\>

#### Defined in

[packages/core/src/Node.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Node.ts#L27)

---

### OpenAIStreamToken

Ƭ **OpenAIStreamToken**: [`DefaultStreamToken`](interfaces/DefaultStreamToken.md)

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/callbacks/CallbackManager.ts#L41)

---

### QueryKeywordExtractPrompt

Ƭ **QueryKeywordExtractPrompt**: typeof [`defaultQueryKeywordExtractPrompt`](#defaultquerykeywordextractprompt)

#### Defined in

[packages/core/src/Prompt.ts:398](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L398)

---

### RefinePrompt

Ƭ **RefinePrompt**: typeof [`defaultRefinePrompt`](#defaultrefineprompt)

#### Defined in

[packages/core/src/Prompt.ts:106](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L106)

---

### RelatedNodeType

Ƭ **RelatedNodeType**<`T`\>: [`RelatedNodeInfo`](interfaces/RelatedNodeInfo.md)<`T`\> \| [`RelatedNodeInfo`](interfaces/RelatedNodeInfo.md)<`T`\>[]

#### Type parameters

| Name | Type                                                      |
| :--- | :-------------------------------------------------------- |
| `T`  | extends [`Metadata`](#metadata) = [`Metadata`](#metadata) |

#### Defined in

[packages/core/src/Node.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Node.ts#L36)

---

### SimpleDirectoryReaderLoadDataProps

Ƭ **SimpleDirectoryReaderLoadDataProps**: `Object`

#### Type declaration

| Name               | Type                                                          |
| :----------------- | :------------------------------------------------------------ |
| `defaultReader?`   | [`BaseReader`](interfaces/BaseReader.md) \| `null`            |
| `directoryPath`    | `string`                                                      |
| `fileExtToReader?` | `Record`<`string`, [`BaseReader`](interfaces/BaseReader.md)\> |
| `fs?`              | [`CompleteFileSystem`](#completefilesystem)                   |

#### Defined in

[packages/core/src/readers/SimpleDirectoryReader.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/readers/SimpleDirectoryReader.ts#L52)

---

### SimplePrompt

Ƭ **SimplePrompt**: (`input`: `Record`<`string`, `string` \| `undefined`\>) => `string`

#### Type declaration

▸ (`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

##### Parameters

| Name    | Type                                         |
| :------ | :------------------------------------------- |
| `input` | `Record`<`string`, `string` \| `undefined`\> |

##### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L10)

---

### SubQuestionPrompt

Ƭ **SubQuestionPrompt**: typeof [`defaultSubQuestionPrompt`](#defaultsubquestionprompt)

#### Defined in

[packages/core/src/Prompt.ts:314](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L314)

---

### SummaryPrompt

Ƭ **SummaryPrompt**: typeof [`defaultSummaryPrompt`](#defaultsummaryprompt)

#### Defined in

[packages/core/src/Prompt.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L73)

---

### TextQaPrompt

Ƭ **TextQaPrompt**: typeof [`defaultTextQaPrompt`](#defaulttextqaprompt)

#### Defined in

[packages/core/src/Prompt.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L37)

---

### TreeSummarizePrompt

Ƭ **TreeSummarizePrompt**: typeof [`defaultTreeSummarizePrompt`](#defaulttreesummarizeprompt)

#### Defined in

[packages/core/src/Prompt.ts:131](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L131)

## Variables

### ALL_AVAILABLE_ANTHROPIC_MODELS

• `Const` **ALL_AVAILABLE_ANTHROPIC_MODELS**: `Object`

#### Type declaration

| Name                             | Type                                   |
| :------------------------------- | :------------------------------------- |
| `claude-2`                       | { `contextWindow`: `number` = 200000 } |
| `claude-2.contextWindow`         | `number`                               |
| `claude-instant-1`               | { `contextWindow`: `number` = 100000 } |
| `claude-instant-1.contextWindow` | `number`                               |

#### Defined in

[packages/core/src/llm/LLM.ts:640](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L640)

---

### ALL_AVAILABLE_LLAMADEUCE_MODELS

• `Const` **ALL_AVAILABLE_LLAMADEUCE_MODELS**: `Object`

#### Type declaration

| Name                                  | Type                                                                                                                                                            |
| :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Llama-2-13b-chat-4bit`               | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "meta/llama-2-13b-chat:f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d" }       |
| `Llama-2-13b-chat-4bit.contextWindow` | `number`                                                                                                                                                        |
| `Llama-2-13b-chat-4bit.replicateApi`  | `string`                                                                                                                                                        |
| `Llama-2-13b-chat-old`                | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5" } |
| `Llama-2-13b-chat-old.contextWindow`  | `number`                                                                                                                                                        |
| `Llama-2-13b-chat-old.replicateApi`   | `string`                                                                                                                                                        |
| `Llama-2-70b-chat-4bit`               | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3" }       |
| `Llama-2-70b-chat-4bit.contextWindow` | `number`                                                                                                                                                        |
| `Llama-2-70b-chat-4bit.replicateApi`  | `string`                                                                                                                                                        |
| `Llama-2-70b-chat-old`                | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "replicate/llama70b-v2-chat:e951f18578850b652510200860fc4ea62b3b16fac280f83ff32282f87bbd2e48" }  |
| `Llama-2-70b-chat-old.contextWindow`  | `number`                                                                                                                                                        |
| `Llama-2-70b-chat-old.replicateApi`   | `string`                                                                                                                                                        |
| `Llama-2-7b-chat-4bit`                | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "meta/llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0" }        |
| `Llama-2-7b-chat-4bit.contextWindow`  | `number`                                                                                                                                                        |
| `Llama-2-7b-chat-4bit.replicateApi`   | `string`                                                                                                                                                        |
| `Llama-2-7b-chat-old`                 | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "a16z-infra/llama7b-v2-chat:4f0a4744c7295c024a1de15e1a63c880d3da035fa1f49bfd344fe076074c8eea" }  |
| `Llama-2-7b-chat-old.contextWindow`   | `number`                                                                                                                                                        |
| `Llama-2-7b-chat-old.replicateApi`    | `string`                                                                                                                                                        |

#### Defined in

[packages/core/src/llm/LLM.ts:370](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L370)

---

### ALL_AVAILABLE_OPENAI_MODELS

• `Const` **ALL_AVAILABLE_OPENAI_MODELS**: `Object`

We currently support GPT-3.5 and GPT-4 models

#### Type declaration

| Name                                 | Type                                   |
| :----------------------------------- | :------------------------------------- |
| `gpt-3.5-turbo`                      | { `contextWindow`: `number` = 4096 }   |
| `gpt-3.5-turbo.contextWindow`        | `number`                               |
| `gpt-3.5-turbo-1106`                 | { `contextWindow`: `number` = 16384 }  |
| `gpt-3.5-turbo-1106.contextWindow`   | `number`                               |
| `gpt-3.5-turbo-16k`                  | { `contextWindow`: `number` = 16384 }  |
| `gpt-3.5-turbo-16k.contextWindow`    | `number`                               |
| `gpt-4`                              | { `contextWindow`: `number` = 8192 }   |
| `gpt-4.contextWindow`                | `number`                               |
| `gpt-4-1106-preview`                 | { `contextWindow`: `number` = 128000 } |
| `gpt-4-1106-preview.contextWindow`   | `number`                               |
| `gpt-4-32k`                          | { `contextWindow`: `number` = 32768 }  |
| `gpt-4-32k.contextWindow`            | `number`                               |
| `gpt-4-vision-preview`               | { `contextWindow`: `number` = 8192 }   |
| `gpt-4-vision-preview.contextWindow` | `number`                               |

#### Defined in

[packages/core/src/llm/LLM.ts:119](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L119)

---

### DEFAULT_CHUNK_OVERLAP

• `Const` **DEFAULT_CHUNK_OVERLAP**: `20`

#### Defined in

[packages/core/src/constants.ts:5](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L5)

---

### DEFAULT_CHUNK_OVERLAP_RATIO

• `Const` **DEFAULT_CHUNK_OVERLAP_RATIO**: `0.1`

#### Defined in

[packages/core/src/constants.ts:6](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L6)

---

### DEFAULT_CHUNK_SIZE

• `Const` **DEFAULT_CHUNK_SIZE**: `1024`

#### Defined in

[packages/core/src/constants.ts:4](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L4)

---

### DEFAULT_COLLECTION

• `Const` **DEFAULT_COLLECTION**: `"data"`

#### Defined in

[packages/core/src/storage/constants.ts:1](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/constants.ts#L1)

---

### DEFAULT_CONTEXT_WINDOW

• `Const` **DEFAULT_CONTEXT_WINDOW**: `3900`

#### Defined in

[packages/core/src/constants.ts:1](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L1)

---

### DEFAULT_DOC_STORE_PERSIST_FILENAME

• `Const` **DEFAULT_DOC_STORE_PERSIST_FILENAME**: `"doc_store.json"`

#### Defined in

[packages/core/src/storage/constants.ts:4](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/constants.ts#L4)

---

### DEFAULT_EMBEDDING_DIM

• `Const` **DEFAULT_EMBEDDING_DIM**: `1536`

#### Defined in

[packages/core/src/constants.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L10)

---

### DEFAULT_FS

• `Const` **DEFAULT_FS**: [`GenericFileSystem`](interfaces/GenericFileSystem.md) \| [`CompleteFileSystem`](#completefilesystem)

#### Defined in

[packages/core/src/storage/FileSystem.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/FileSystem.ts#L62)

---

### DEFAULT_GRAPH_STORE_PERSIST_FILENAME

• `Const` **DEFAULT_GRAPH_STORE_PERSIST_FILENAME**: `"graph_store.json"`

#### Defined in

[packages/core/src/storage/constants.ts:6](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/constants.ts#L6)

---

### DEFAULT_INDEX_STORE_PERSIST_FILENAME

• `Const` **DEFAULT_INDEX_STORE_PERSIST_FILENAME**: `"index_store.json"`

#### Defined in

[packages/core/src/storage/constants.ts:3](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/constants.ts#L3)

---

### DEFAULT_NAMESPACE

• `Const` **DEFAULT_NAMESPACE**: `"docstore"`

#### Defined in

[packages/core/src/storage/constants.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/constants.ts#L7)

---

### DEFAULT_NUM_OUTPUTS

• `Const` **DEFAULT_NUM_OUTPUTS**: `256`

#### Defined in

[packages/core/src/constants.ts:2](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L2)

---

### DEFAULT_PADDING

• `Const` **DEFAULT_PADDING**: `5`

#### Defined in

[packages/core/src/constants.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L11)

---

### DEFAULT_PERSIST_DIR

• `Const` **DEFAULT_PERSIST_DIR**: `"./storage"`

#### Defined in

[packages/core/src/storage/constants.ts:2](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/constants.ts#L2)

---

### DEFAULT_SIMILARITY_TOP_K

• `Const` **DEFAULT_SIMILARITY_TOP_K**: `2`

#### Defined in

[packages/core/src/constants.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/constants.ts#L7)

---

### DEFAULT_VECTOR_STORE_PERSIST_FILENAME

• `Const` **DEFAULT_VECTOR_STORE_PERSIST_FILENAME**: `"vector_store.json"`

#### Defined in

[packages/core/src/storage/constants.ts:5](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/constants.ts#L5)

---

### FILE_EXT_TO_READER

• `Const` **FILE_EXT_TO_READER**: `Record`<`string`, [`BaseReader`](interfaces/BaseReader.md)\>

#### Defined in

[packages/core/src/readers/SimpleDirectoryReader.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/readers/SimpleDirectoryReader.ts#L38)

---

### GPT35_MODELS

• `Const` **GPT35_MODELS**: `Object`

#### Type declaration

| Name                               | Type                                  |
| :--------------------------------- | :------------------------------------ |
| `gpt-3.5-turbo`                    | { `contextWindow`: `number` = 4096 }  |
| `gpt-3.5-turbo.contextWindow`      | `number`                              |
| `gpt-3.5-turbo-1106`               | { `contextWindow`: `number` = 16384 } |
| `gpt-3.5-turbo-1106.contextWindow` | `number`                              |
| `gpt-3.5-turbo-16k`                | { `contextWindow`: `number` = 16384 } |
| `gpt-3.5-turbo-16k.contextWindow`  | `number`                              |

#### Defined in

[packages/core/src/llm/LLM.ts:110](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L110)

---

### GPT4_MODELS

• `Const` **GPT4_MODELS**: `Object`

#### Type declaration

| Name                                 | Type                                   |
| :----------------------------------- | :------------------------------------- |
| `gpt-4`                              | { `contextWindow`: `number` = 8192 }   |
| `gpt-4.contextWindow`                | `number`                               |
| `gpt-4-1106-preview`                 | { `contextWindow`: `number` = 128000 } |
| `gpt-4-1106-preview.contextWindow`   | `number`                               |
| `gpt-4-32k`                          | { `contextWindow`: `number` = 32768 }  |
| `gpt-4-32k.contextWindow`            | `number`                               |
| `gpt-4-vision-preview`               | { `contextWindow`: `number` = 8192 }   |
| `gpt-4-vision-preview.contextWindow` | `number`                               |

#### Defined in

[packages/core/src/llm/LLM.ts:103](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/llm/LLM.ts#L103)

---

### globalsHelper

• `Const` **globalsHelper**: `GlobalsHelper`

#### Defined in

[packages/core/src/GlobalsHelper.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/GlobalsHelper.ts#L76)

---

### unixLineSeparator

• `Const` **unixLineSeparator**: `"\n"`

#### Defined in

[packages/core/src/TextSplitter.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L44)

---

### unixParagraphSeparator

• `Const` **unixParagraphSeparator**: `string`

#### Defined in

[packages/core/src/TextSplitter.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L46)

---

### windowsLineSeparator

• `Const` **windowsLineSeparator**: `"\r\n"`

#### Defined in

[packages/core/src/TextSplitter.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L45)

---

### windowsParagraphSeparator

• `Const` **windowsParagraphSeparator**: `string`

#### Defined in

[packages/core/src/TextSplitter.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L47)

## Functions

### anthropicTextQaPrompt

▸ **anthropicTextQaPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L39)

---

### buildToolsText

▸ **buildToolsText**(`tools`): `string`

#### Parameters

| Name    | Type                                           |
| :------ | :--------------------------------------------- |
| `tools` | [`ToolMetadata`](interfaces/ToolMetadata.md)[] |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:243](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L243)

---

### cjkSentenceTokenizer

▸ **cjkSentenceTokenizer**(`text`): `null` \| `RegExpMatchArray`

Tokenizes sentences. Suitable for Chinese, Japanese, and Korean.

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `text` | `string` |

#### Returns

`null` \| `RegExpMatchArray`

#### Defined in

[packages/core/src/TextSplitter.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L36)

---

### defaultChoiceSelectPrompt

▸ **defaultChoiceSelectPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:133](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L133)

---

### defaultCondenseQuestionPrompt

▸ **defaultCondenseQuestionPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:330](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L330)

---

### defaultContextSystemPrompt

▸ **defaultContextSystemPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:360](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L360)

---

### defaultKeywordExtractPrompt

▸ **defaultKeywordExtractPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:369](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L369)

---

### defaultQueryKeywordExtractPrompt

▸ **defaultQueryKeywordExtractPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:384](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L384)

---

### defaultRefinePrompt

▸ **defaultRefinePrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:91](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L91)

---

### defaultSubQuestionPrompt

▸ **defaultSubQuestionPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:284](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L284)

---

### defaultSummaryPrompt

▸ **defaultSummaryPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L62)

---

### defaultTextQaPrompt

▸ **defaultTextQaPrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L27)

---

### defaultTreeSummarizePrompt

▸ **defaultTreeSummarizePrompt**(`«destructured»`): `string`

#### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:121](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L121)

---

### englishSentenceTokenizer

▸ **englishSentenceTokenizer**(`text`): `null` \| `RegExpMatchArray`

Tokenizes sentences. Suitable for English and most European languages.

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `text` | `string` |

#### Returns

`null` \| `RegExpMatchArray`

#### Defined in

[packages/core/src/TextSplitter.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L26)

---

### exists

▸ **exists**(`fs`, `path`): `Promise`<`boolean`\>

Checks if a file exists.
Analogous to the os.path.exists function from Python.

#### Parameters

| Name   | Type                                                   | Description                    |
| :----- | :----------------------------------------------------- | :----------------------------- |
| `fs`   | [`GenericFileSystem`](interfaces/GenericFileSystem.md) | The filesystem to use.         |
| `path` | `string`                                               | The path to the file to check. |

#### Returns

`Promise`<`boolean`\>

A promise that resolves to true if the file exists, false otherwise.

#### Defined in

[packages/core/src/storage/FileSystem.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/FileSystem.ts#L74)

---

### getBiggestPrompt

▸ **getBiggestPrompt**(`prompts`): [`SimplePrompt`](#simpleprompt)

Get biggest empty prompt size from a list of prompts.
Used to calculate the maximum size of inputs to the LLM.

#### Parameters

| Name      | Type                              |
| :-------- | :-------------------------------- |
| `prompts` | [`SimplePrompt`](#simpleprompt)[] |

#### Returns

[`SimplePrompt`](#simpleprompt)

#### Defined in

[packages/core/src/PromptHelper.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/PromptHelper.ts#L21)

---

### getEmptyPromptTxt

▸ **getEmptyPromptTxt**(`prompt`): `string`

#### Parameters

| Name     | Type                            |
| :------- | :------------------------------ |
| `prompt` | [`SimplePrompt`](#simpleprompt) |

#### Returns

`string`

#### Defined in

[packages/core/src/PromptHelper.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/PromptHelper.ts#L11)

---

### getNodeFS

▸ **getNodeFS**(): [`CompleteFileSystem`](#completefilesystem)

#### Returns

[`CompleteFileSystem`](#completefilesystem)

#### Defined in

[packages/core/src/storage/FileSystem.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/FileSystem.ts#L51)

---

### getNodesFromDocument

▸ **getNodesFromDocument**(`doc`, `textSplitter`, `includeMetadata?`, `includePrevNextRel?`): [`ImageDocument`](classes/ImageDocument.md)<`any`\>[] \| [`TextNode`](classes/TextNode.md)<[`Metadata`](#metadata)\>[]

Generates an array of nodes from a document.

#### Parameters

| Name                 | Type                                                        | Default value | Description                                                      |
| :------------------- | :---------------------------------------------------------- | :------------ | :--------------------------------------------------------------- |
| `doc`                | [`BaseNode`](classes/BaseNode.md)<[`Metadata`](#metadata)\> | `undefined`   | -                                                                |
| `textSplitter`       | [`SentenceSplitter`](classes/SentenceSplitter.md)           | `undefined`   | The text splitter to use.                                        |
| `includeMetadata`    | `boolean`                                                   | `true`        | Whether to include metadata in the nodes.                        |
| `includePrevNextRel` | `boolean`                                                   | `true`        | Whether to include previous and next relationships in the nodes. |

#### Returns

[`ImageDocument`](classes/ImageDocument.md)<`any`\>[] \| [`TextNode`](classes/TextNode.md)<[`Metadata`](#metadata)\>[]

An array of nodes.

#### Defined in

[packages/core/src/NodeParser.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/NodeParser.ts#L35)

---

### getResponseBuilder

▸ **getResponseBuilder**(`serviceContext`, `responseMode?`): `BaseResponseBuilder`

#### Parameters

| Name             | Type                                             |
| :--------------- | :----------------------------------------------- |
| `serviceContext` | [`ServiceContext`](interfaces/ServiceContext.md) |
| `responseMode?`  | `ResponseMode`                                   |

#### Returns

`BaseResponseBuilder`

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:271](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ResponseSynthesizer.ts#L271)

---

### getTextSplitsFromDocument

▸ **getTextSplitsFromDocument**(`document`, `textSplitter`): `string`[]

Splits the text of a document into smaller parts.

#### Parameters

| Name           | Type                                                        | Description               |
| :------------- | :---------------------------------------------------------- | :------------------------ |
| `document`     | [`Document`](classes/Document.md)<[`Metadata`](#metadata)\> | The document to split.    |
| `textSplitter` | [`SentenceSplitter`](classes/SentenceSplitter.md)           | The text splitter to use. |

#### Returns

`string`[]

An array of text splits.

#### Defined in

[packages/core/src/NodeParser.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/NodeParser.ts#L17)

---

### getTopKEmbeddings

▸ **getTopKEmbeddings**(`queryEmbedding`, `embeddings`, `similarityTopK?`, `embeddingIds?`, `similarityCutoff?`): [`number`[], `any`[]]

Get the top K embeddings from a list of embeddings ordered by similarity to the query.

#### Parameters

| Name               | Type               | Default value              | Description                                   |
| :----------------- | :----------------- | :------------------------- | :-------------------------------------------- |
| `queryEmbedding`   | `number`[]         | `undefined`                |                                               |
| `embeddings`       | `number`[][]       | `undefined`                | list of embeddings to consider                |
| `similarityTopK`   | `number`           | `DEFAULT_SIMILARITY_TOP_K` | max number of embeddings to return, default 2 |
| `embeddingIds`     | `null` \| `any`[]  | `null`                     | ids of embeddings in the embeddings list      |
| `similarityCutoff` | `null` \| `number` | `null`                     | minimum similarity score                      |

#### Returns

[`number`[], `any`[]]

#### Defined in

[packages/core/src/embeddings/utils.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/utils.ts#L69)

---

### getTopKEmbeddingsLearner

▸ **getTopKEmbeddingsLearner**(`queryEmbedding`, `embeddings`, `similarityTopK?`, `embeddingsIds?`, `queryMode?`): [`number`[], `any`[]]

#### Parameters

| Name              | Type                                                    | Default value              |
| :---------------- | :------------------------------------------------------ | :------------------------- |
| `queryEmbedding`  | `number`[]                                              | `undefined`                |
| `embeddings`      | `number`[][]                                            | `undefined`                |
| `similarityTopK?` | `number`                                                | `undefined`                |
| `embeddingsIds?`  | `any`[]                                                 | `undefined`                |
| `queryMode`       | [`VectorStoreQueryMode`](enums/VectorStoreQueryMode.md) | `VectorStoreQueryMode.SVM` |

#### Returns

[`number`[], `any`[]]

#### Defined in

[packages/core/src/embeddings/utils.ts:111](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/utils.ts#L111)

---

### getTopKMMREmbeddings

▸ **getTopKMMREmbeddings**(`queryEmbedding`, `embeddings`, `similarityFn?`, `similarityTopK?`, `embeddingIds?`, `_similarityCutoff?`, `mmrThreshold?`): [`number`[], `any`[]]

#### Parameters

| Name                | Type                                       | Default value |
| :------------------ | :----------------------------------------- | :------------ |
| `queryEmbedding`    | `number`[]                                 | `undefined`   |
| `embeddings`        | `number`[][]                               | `undefined`   |
| `similarityFn`      | `null` \| (...`args`: `any`[]) => `number` | `null`        |
| `similarityTopK`    | `null` \| `number`                         | `null`        |
| `embeddingIds`      | `null` \| `any`[]                          | `null`        |
| `_similarityCutoff` | `null` \| `number`                         | `null`        |
| `mmrThreshold`      | `null` \| `number`                         | `null`        |

#### Returns

[`number`[], `any`[]]

#### Defined in

[packages/core/src/embeddings/utils.ts:123](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/utils.ts#L123)

---

### jsonToIndexStruct

▸ **jsonToIndexStruct**(`json`): [`IndexStruct`](classes/IndexStruct.md)

#### Parameters

| Name   | Type  |
| :----- | :---- |
| `json` | `any` |

#### Returns

[`IndexStruct`](classes/IndexStruct.md)

#### Defined in

[packages/core/src/indices/BaseIndex.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/BaseIndex.ts#L74)

---

### jsonToNode

▸ **jsonToNode**(`json`, `type?`): [`TextNode`](classes/TextNode.md)<[`Metadata`](#metadata)\>

#### Parameters

| Name    | Type                                |
| :------ | :---------------------------------- |
| `json`  | `any`                               |
| `type?` | [`ObjectType`](enums/ObjectType.md) |

#### Returns

[`TextNode`](classes/TextNode.md)<[`Metadata`](#metadata)\>

#### Defined in

[packages/core/src/Node.ts:268](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Node.ts#L268)

---

### messagesToHistoryStr

▸ **messagesToHistoryStr**(`messages`): `string`

#### Parameters

| Name       | Type                                         |
| :--------- | :------------------------------------------- |
| `messages` | [`ChatMessage`](interfaces/ChatMessage.md)[] |

#### Returns

`string`

#### Defined in

[packages/core/src/Prompt.ts:348](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/Prompt.ts#L348)

---

### parseJsonMarkdown

▸ **parseJsonMarkdown**(`text`): `any`

#### Parameters

| Name   | Type     | Description                |
| :----- | :------- | :------------------------- |
| `text` | `string` | A markdown block with JSON |

#### Returns

`any`

parsed JSON object

#### Defined in

[packages/core/src/OutputParser.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/OutputParser.ts#L56)

---

### readImage

▸ **readImage**(`input`): `Promise`<`RawImage`\>

#### Parameters

| Name    | Type                      |
| :------ | :------------------------ |
| `input` | [`ImageType`](#imagetype) |

#### Returns

`Promise`<`RawImage`\>

#### Defined in

[packages/core/src/embeddings/utils.ts:188](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/utils.ts#L188)

---

### serviceContextFromDefaults

▸ **serviceContextFromDefaults**(`options?`): [`ServiceContext`](interfaces/ServiceContext.md)

#### Parameters

| Name       | Type                                                           |
| :--------- | :------------------------------------------------------------- |
| `options?` | [`ServiceContextOptions`](interfaces/ServiceContextOptions.md) |

#### Returns

[`ServiceContext`](interfaces/ServiceContext.md)

#### Defined in

[packages/core/src/ServiceContext.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ServiceContext.ts#L30)

---

### serviceContextFromServiceContext

▸ **serviceContextFromServiceContext**(`serviceContext`, `options`): `Object`

#### Parameters

| Name             | Type                                                           |
| :--------------- | :------------------------------------------------------------- |
| `serviceContext` | [`ServiceContext`](interfaces/ServiceContext.md)               |
| `options`        | [`ServiceContextOptions`](interfaces/ServiceContextOptions.md) |

#### Returns

`Object`

| Name              | Type                                            |
| :---------------- | :---------------------------------------------- |
| `callbackManager` | [`CallbackManager`](classes/CallbackManager.md) |
| `embedModel`      | [`BaseEmbedding`](classes/BaseEmbedding.md)     |
| `llm`             | [`LLM`](interfaces/LLM.md)                      |
| `nodeParser`      | [`NodeParser`](interfaces/NodeParser.md)        |
| `promptHelper`    | [`PromptHelper`](classes/PromptHelper.md)       |

#### Defined in

[packages/core/src/ServiceContext.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ServiceContext.ts#L48)

---

### similarity

▸ **similarity**(`embedding1`, `embedding2`, `mode?`): `number`

The similarity between two embeddings.

#### Parameters

| Name         | Type                                        | Default value            |
| :----------- | :------------------------------------------ | :----------------------- |
| `embedding1` | `number`[]                                  | `undefined`              |
| `embedding2` | `number`[]                                  | `undefined`              |
| `mode`       | [`SimilarityType`](enums/SimilarityType.md) | `SimilarityType.DEFAULT` |

#### Returns

`number`

similarity score with higher numbers meaning the two embeddings are more similar

#### Defined in

[packages/core/src/embeddings/utils.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/embeddings/utils.ts#L15)

---

### storageContextFromDefaults

▸ **storageContextFromDefaults**(`«destructured»`): `Promise`<[`StorageContext`](interfaces/StorageContext.md)\>

#### Parameters

| Name             | Type            |
| :--------------- | :-------------- |
| `«destructured»` | `BuilderParams` |

#### Returns

`Promise`<[`StorageContext`](interfaces/StorageContext.md)\>

#### Defined in

[packages/core/src/storage/StorageContext.ts:24](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/StorageContext.ts#L24)

---

### walk

▸ **walk**(`fs`, `dirPath`): `AsyncIterable`<`string`\>

Recursively traverses a directory and yields all the paths to the files in it.

#### Parameters

| Name      | Type                                                     | Description                            |
| :-------- | :------------------------------------------------------- | :------------------------------------- |
| `fs`      | [`WalkableFileSystem`](interfaces/WalkableFileSystem.md) | The filesystem to use.                 |
| `dirPath` | `string`                                                 | The path to the directory to traverse. |

#### Returns

`AsyncIterable`<`string`\>

#### Defined in

[packages/core/src/storage/FileSystem.ts:91](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/storage/FileSystem.ts#L91)
