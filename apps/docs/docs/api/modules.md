---
id: "modules"
title: "llamaindex"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Enumerations

- [DeuceChatStrategy](enums/DeuceChatStrategy.md)
- [IndexStructType](enums/IndexStructType.md)
- [ListRetrieverMode](enums/ListRetrieverMode.md)
- [MetadataMode](enums/MetadataMode.md)
- [NodeRelationship](enums/NodeRelationship.md)
- [ObjectType](enums/ObjectType.md)
- [SimilarityType](enums/SimilarityType.md)
- [VectorStoreQueryMode](enums/VectorStoreQueryMode.md)

## Classes

- [Anthropic](classes/Anthropic.md)
- [BaseEmbedding](classes/BaseEmbedding.md)
- [BaseIndex](classes/BaseIndex.md)
- [BaseNode](classes/BaseNode.md)
- [CallbackManager](classes/CallbackManager.md)
- [CompactAndRefine](classes/CompactAndRefine.md)
- [CondenseQuestionChatEngine](classes/CondenseQuestionChatEngine.md)
- [ContextChatEngine](classes/ContextChatEngine.md)
- [Document](classes/Document.md)
- [InMemoryFileSystem](classes/InMemoryFileSystem.md)
- [IndexDict](classes/IndexDict.md)
- [IndexList](classes/IndexList.md)
- [IndexNode](classes/IndexNode.md)
- [IndexStruct](classes/IndexStruct.md)
- [LLMQuestionGenerator](classes/LLMQuestionGenerator.md)
- [ListIndex](classes/ListIndex.md)
- [ListIndexLLMRetriever](classes/ListIndexLLMRetriever.md)
- [ListIndexRetriever](classes/ListIndexRetriever.md)
- [LlamaDeuce](classes/LlamaDeuce.md)
- [OpenAI](classes/OpenAI.md)
- [OpenAIEmbedding](classes/OpenAIEmbedding.md)
- [PDFReader](classes/PDFReader.md)
- [Refine](classes/Refine.md)
- [Response](classes/Response.md)
- [ResponseSynthesizer](classes/ResponseSynthesizer.md)
- [RetrieverQueryEngine](classes/RetrieverQueryEngine.md)
- [SentenceSplitter](classes/SentenceSplitter.md)
- [SimpleChatEngine](classes/SimpleChatEngine.md)
- [SimpleDirectoryReader](classes/SimpleDirectoryReader.md)
- [SimpleDocumentStore](classes/SimpleDocumentStore.md)
- [SimpleIndexStore](classes/SimpleIndexStore.md)
- [SimpleNodeParser](classes/SimpleNodeParser.md)
- [SimpleResponseBuilder](classes/SimpleResponseBuilder.md)
- [SimpleVectorStore](classes/SimpleVectorStore.md)
- [SubQuestionOutputParser](classes/SubQuestionOutputParser.md)
- [SubQuestionQueryEngine](classes/SubQuestionQueryEngine.md)
- [TextFileReader](classes/TextFileReader.md)
- [TextNode](classes/TextNode.md)
- [TreeSummarize](classes/TreeSummarize.md)
- [VectorIndexRetriever](classes/VectorIndexRetriever.md)
- [VectorStoreIndex](classes/VectorStoreIndex.md)

## Interfaces

- [BaseIndexInit](interfaces/BaseIndexInit.md)
- [BaseOutputParser](interfaces/BaseOutputParser.md)
- [BaseQueryEngine](interfaces/BaseQueryEngine.md)
- [BaseQuestionGenerator](interfaces/BaseQuestionGenerator.md)
- [BaseReader](interfaces/BaseReader.md)
- [BaseRetriever](interfaces/BaseRetriever.md)
- [BaseTool](interfaces/BaseTool.md)
- [ChatEngine](interfaces/ChatEngine.md)
- [ChatMessage](interfaces/ChatMessage.md)
- [ChatResponse](interfaces/ChatResponse.md)
- [Event](interfaces/Event.md)
- [ExactMatchFilter](interfaces/ExactMatchFilter.md)
- [GenericFileSystem](interfaces/GenericFileSystem.md)
- [LLM](interfaces/LLM.md)
- [MetadataFilters](interfaces/MetadataFilters.md)
- [MetadataInfo](interfaces/MetadataInfo.md)
- [NodeParser](interfaces/NodeParser.md)
- [NodeWithScore](interfaces/NodeWithScore.md)
- [QueryEngineTool](interfaces/QueryEngineTool.md)
- [RelatedNodeInfo](interfaces/RelatedNodeInfo.md)
- [RetrievalCallbackResponse](interfaces/RetrievalCallbackResponse.md)
- [ServiceContext](interfaces/ServiceContext.md)
- [ServiceContextOptions](interfaces/ServiceContextOptions.md)
- [StorageContext](interfaces/StorageContext.md)
- [StreamCallbackResponse](interfaces/StreamCallbackResponse.md)
- [StreamToken](interfaces/StreamToken.md)
- [StructuredOutput](interfaces/StructuredOutput.md)
- [SubQuestion](interfaces/SubQuestion.md)
- [ToolMetadata](interfaces/ToolMetadata.md)
- [VectorIndexConstructorProps](interfaces/VectorIndexConstructorProps.md)
- [VectorIndexOptions](interfaces/VectorIndexOptions.md)
- [VectorStore](interfaces/VectorStore.md)
- [VectorStoreInfo](interfaces/VectorStoreInfo.md)
- [VectorStoreQuery](interfaces/VectorStoreQuery.md)
- [VectorStoreQueryResult](interfaces/VectorStoreQueryResult.md)
- [VectorStoreQuerySpec](interfaces/VectorStoreQuerySpec.md)
- [WalkableFileSystem](interfaces/WalkableFileSystem.md)

## Type Aliases

### CompleteFileSystem

Ƭ **CompleteFileSystem**: [`GenericFileSystem`](interfaces/GenericFileSystem.md) & [`WalkableFileSystem`](interfaces/WalkableFileSystem.md)

#### Defined in

[storage/FileSystem.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/FileSystem.ts#L49)

___

### CompletionResponse

Ƭ **CompletionResponse**: [`ChatResponse`](interfaces/ChatResponse.md)

#### Defined in

[llm/LLM.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L39)

___

### EventTag

Ƭ **EventTag**: ``"intermediate"`` \| ``"final"``

#### Defined in

[callbacks/CallbackManager.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/callbacks/CallbackManager.ts#L10)

___

### EventType

Ƭ **EventType**: ``"retrieve"`` \| ``"llmPredict"`` \| ``"wrapper"``

#### Defined in

[callbacks/CallbackManager.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/callbacks/CallbackManager.ts#L11)

___

### MessageType

Ƭ **MessageType**: ``"user"`` \| ``"assistant"`` \| ``"system"`` \| ``"generic"`` \| ``"function"``

#### Defined in

[llm/LLM.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L20)

___

### RelatedNodeType

Ƭ **RelatedNodeType**: [`RelatedNodeInfo`](interfaces/RelatedNodeInfo.md) \| [`RelatedNodeInfo`](interfaces/RelatedNodeInfo.md)[]

#### Defined in

[Node.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L33)

___

### SimpleDirectoryReaderLoadDataProps

Ƭ **SimpleDirectoryReaderLoadDataProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultReader?` | [`BaseReader`](interfaces/BaseReader.md) \| ``null`` |
| `directoryPath` | `string` |
| `fileExtToReader?` | `Record`<`string`, [`BaseReader`](interfaces/BaseReader.md)\> |
| `fs?` | [`CompleteFileSystem`](modules.md#completefilesystem) |

#### Defined in

[readers/SimpleDirectoryReader.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/SimpleDirectoryReader.ts#L26)

___

### SimplePrompt

Ƭ **SimplePrompt**: (`input`: `Record`<`string`, `string`\>) => `string`

#### Type declaration

▸ (`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

##### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

## Variables

### ALL\_AVAILABLE\_LLAMADEUCE\_MODELS

• `Const` **ALL\_AVAILABLE\_LLAMADEUCE\_MODELS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Llama-2-13b-chat` | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "a16z-infra/llama13b-v2-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5" } |
| `Llama-2-13b-chat.contextWindow` | `number` |
| `Llama-2-13b-chat.replicateApi` | `string` |
| `Llama-2-13b-chat-4bit` | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "a16z-infra/llama13b-v2-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52" } |
| `Llama-2-13b-chat-4bit.contextWindow` | `number` |
| `Llama-2-13b-chat-4bit.replicateApi` | `string` |
| `Llama-2-70b-chat-4bit` | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "replicate/llama70b-v2-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1" } |
| `Llama-2-70b-chat-4bit.contextWindow` | `number` |
| `Llama-2-70b-chat-4bit.replicateApi` | `string` |
| `Llama-2-70b-chat-old` | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "replicate/llama70b-v2-chat:e951f18578850b652510200860fc4ea62b3b16fac280f83ff32282f87bbd2e48" } |
| `Llama-2-70b-chat-old.contextWindow` | `number` |
| `Llama-2-70b-chat-old.replicateApi` | `string` |
| `Llama-2-7b-chat` | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "a16z-infra/llama7b-v2-chat:4f0a4744c7295c024a1de15e1a63c880d3da035fa1f49bfd344fe076074c8eea" } |
| `Llama-2-7b-chat.contextWindow` | `number` |
| `Llama-2-7b-chat.replicateApi` | `string` |
| `Llama-2-7b-chat-4bit` | { `contextWindow`: `number` = 4096; `replicateApi`: `string` = "a16z-infra/llama7b-v2-chat:4f0b260b6a13eb53a6b1891f089d57c08f41003ae79458be5011303d81a394dc" } |
| `Llama-2-7b-chat-4bit.contextWindow` | `number` |
| `Llama-2-7b-chat-4bit.replicateApi` | `string` |

#### Defined in

[llm/LLM.ts:205](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L205)

___

### ALL\_AVAILABLE\_OPENAI\_MODELS

• `Const` **ALL\_AVAILABLE\_OPENAI\_MODELS**: `Object`

We currently support GPT-3.5 and GPT-4 models

#### Type declaration

| Name | Type |
| :------ | :------ |
| `gpt-3.5-turbo` | { `contextWindow`: `number` = 4096 } |
| `gpt-3.5-turbo.contextWindow` | `number` |
| `gpt-3.5-turbo-16k` | { `contextWindow`: `number` = 16384 } |
| `gpt-3.5-turbo-16k.contextWindow` | `number` |
| `gpt-4` | { `contextWindow`: `number` = 8192 } |
| `gpt-4.contextWindow` | `number` |
| `gpt-4-32k` | { `contextWindow`: `number` = 32768 } |
| `gpt-4-32k.contextWindow` | `number` |

#### Defined in

[llm/LLM.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L71)

___

### DEFAULT\_CHUNK\_OVERLAP

• `Const` **DEFAULT\_CHUNK\_OVERLAP**: ``20``

#### Defined in

[constants.ts:5](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L5)

___

### DEFAULT\_CHUNK\_OVERLAP\_RATIO

• `Const` **DEFAULT\_CHUNK\_OVERLAP\_RATIO**: ``0.1``

#### Defined in

[constants.ts:6](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L6)

___

### DEFAULT\_CHUNK\_SIZE

• `Const` **DEFAULT\_CHUNK\_SIZE**: ``1024``

#### Defined in

[constants.ts:4](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L4)

___

### DEFAULT\_COLLECTION

• `Const` **DEFAULT\_COLLECTION**: ``"data"``

#### Defined in

[storage/constants.ts:1](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/constants.ts#L1)

___

### DEFAULT\_CONTEXT\_WINDOW

• `Const` **DEFAULT\_CONTEXT\_WINDOW**: ``3900``

#### Defined in

[constants.ts:1](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L1)

___

### DEFAULT\_DOC\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_DOC\_STORE\_PERSIST\_FILENAME**: ``"doc_store.json"``

#### Defined in

[storage/constants.ts:4](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/constants.ts#L4)

___

### DEFAULT\_EMBEDDING\_DIM

• `Const` **DEFAULT\_EMBEDDING\_DIM**: ``1536``

#### Defined in

[constants.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L10)

___

### DEFAULT\_FS

• `Const` **DEFAULT\_FS**: [`GenericFileSystem`](interfaces/GenericFileSystem.md) \| [`CompleteFileSystem`](modules.md#completefilesystem)

#### Defined in

[storage/FileSystem.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/FileSystem.ts#L62)

___

### DEFAULT\_GRAPH\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_GRAPH\_STORE\_PERSIST\_FILENAME**: ``"graph_store.json"``

#### Defined in

[storage/constants.ts:6](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/constants.ts#L6)

___

### DEFAULT\_INDEX\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_INDEX\_STORE\_PERSIST\_FILENAME**: ``"index_store.json"``

#### Defined in

[storage/constants.ts:3](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/constants.ts#L3)

___

### DEFAULT\_NAMESPACE

• `Const` **DEFAULT\_NAMESPACE**: ``"docstore"``

#### Defined in

[storage/constants.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/constants.ts#L7)

___

### DEFAULT\_NUM\_OUTPUTS

• `Const` **DEFAULT\_NUM\_OUTPUTS**: ``256``

#### Defined in

[constants.ts:2](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L2)

___

### DEFAULT\_PADDING

• `Const` **DEFAULT\_PADDING**: ``5``

#### Defined in

[constants.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L11)

___

### DEFAULT\_PERSIST\_DIR

• `Const` **DEFAULT\_PERSIST\_DIR**: ``"./storage"``

#### Defined in

[storage/constants.ts:2](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/constants.ts#L2)

___

### DEFAULT\_SIMILARITY\_TOP\_K

• `Const` **DEFAULT\_SIMILARITY\_TOP\_K**: ``2``

#### Defined in

[constants.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/constants.ts#L7)

___

### DEFAULT\_VECTOR\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_VECTOR\_STORE\_PERSIST\_FILENAME**: ``"vector_store.json"``

#### Defined in

[storage/constants.ts:5](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/constants.ts#L5)

___

### GPT4\_MODELS

• `Const` **GPT4\_MODELS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `gpt-4` | { `contextWindow`: `number` = 8192 } |
| `gpt-4.contextWindow` | `number` |
| `gpt-4-32k` | { `contextWindow`: `number` = 32768 } |
| `gpt-4-32k.contextWindow` | `number` |

#### Defined in

[llm/LLM.ts:58](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L58)

___

### TURBO\_MODELS

• `Const` **TURBO\_MODELS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `gpt-3.5-turbo` | { `contextWindow`: `number` = 4096 } |
| `gpt-3.5-turbo.contextWindow` | `number` |
| `gpt-3.5-turbo-16k` | { `contextWindow`: `number` = 16384 } |
| `gpt-3.5-turbo-16k.contextWindow` | `number` |

#### Defined in

[llm/LLM.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L63)

___

### globalsHelper

• `Const` **globalsHelper**: `GlobalsHelper`

#### Defined in

[GlobalsHelper.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/GlobalsHelper.ts#L50)

## Functions

### buildToolsText

▸ **buildToolsText**(`tools`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tools` | [`ToolMetadata`](interfaces/ToolMetadata.md)[] |

#### Returns

`string`

#### Defined in

[Prompt.ts:198](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L198)

___

### contextSystemPrompt

▸ **contextSystemPrompt**(`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

___

### defaultChoiceSelectPrompt

▸ **defaultChoiceSelectPrompt**(`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

___

### defaultCondenseQuestionPrompt

▸ **defaultCondenseQuestionPrompt**(`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

___

### defaultRefinePrompt

▸ **defaultRefinePrompt**(`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

___

### defaultSubQuestionPrompt

▸ **defaultSubQuestionPrompt**(`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

___

### defaultSummaryPrompt

▸ **defaultSummaryPrompt**(`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

___

### defaultTextQaPrompt

▸ **defaultTextQaPrompt**(`input`): `string`

A SimplePrompt is a function that takes a dictionary of inputs and returns a string.
NOTE this is a different interface compared to LlamaIndex Python
NOTE 2: we default to empty string to make it easy to calculate prompt sizes

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `Record`<`string`, `string`\> |

#### Returns

`string`

#### Defined in

[Prompt.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L10)

___

### exists

▸ **exists**(`fs`, `path`): `Promise`<`boolean`\>

Checks if a file exists.
Analogous to the os.path.exists function from Python.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fs` | [`GenericFileSystem`](interfaces/GenericFileSystem.md) | The filesystem to use. |
| `path` | `string` | The path to the file to check. |

#### Returns

`Promise`<`boolean`\>

A promise that resolves to true if the file exists, false otherwise.

#### Defined in

[storage/FileSystem.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/FileSystem.ts#L74)

___

### getNodeFS

▸ **getNodeFS**(): [`CompleteFileSystem`](modules.md#completefilesystem)

#### Returns

[`CompleteFileSystem`](modules.md#completefilesystem)

#### Defined in

[storage/FileSystem.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/FileSystem.ts#L51)

___

### getNodesFromDocument

▸ **getNodesFromDocument**(`document`, `textSplitter`, `includeMetadata?`, `includePrevNextRel?`): [`TextNode`](classes/TextNode.md)[]

Generates an array of nodes from a document.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `document` | [`Document`](classes/Document.md) | `undefined` | The document to generate nodes from. |
| `textSplitter` | [`SentenceSplitter`](classes/SentenceSplitter.md) | `undefined` | The text splitter to use. |
| `includeMetadata` | `boolean` | `true` | Whether to include metadata in the nodes. |
| `includePrevNextRel` | `boolean` | `true` | Whether to include previous and next relationships in the nodes. |

#### Returns

[`TextNode`](classes/TextNode.md)[]

An array of nodes.

#### Defined in

[NodeParser.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L29)

___

### getResponseBuilder

▸ **getResponseBuilder**(`serviceContext`, `responseMode?`): `BaseResponseBuilder`

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext` | [`ServiceContext`](interfaces/ServiceContext.md) |
| `responseMode?` | `ResponseMode` |

#### Returns

`BaseResponseBuilder`

#### Defined in

[ResponseSynthesizer.ts:262](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/ResponseSynthesizer.ts#L262)

___

### getTextSplitsFromDocument

▸ **getTextSplitsFromDocument**(`document`, `textSplitter`): `string`[]

Splits the text of a document into smaller parts.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | [`Document`](classes/Document.md) | The document to split. |
| `textSplitter` | [`SentenceSplitter`](classes/SentenceSplitter.md) | The text splitter to use. |

#### Returns

`string`[]

An array of text splits.

#### Defined in

[NodeParser.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/NodeParser.ts#L11)

___

### getTopKEmbeddings

▸ **getTopKEmbeddings**(`queryEmbedding`, `embeddings`, `similarityTopK?`, `embeddingIds?`, `similarityCutoff?`): [`number`[], `any`[]]

Get the top K embeddings from a list of embeddings ordered by similarity to the query.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `queryEmbedding` | `number`[] | `undefined` |  |
| `embeddings` | `number`[][] | `undefined` | list of embeddings to consider |
| `similarityTopK` | `number` | `DEFAULT_SIMILARITY_TOP_K` | max number of embeddings to return, default 2 |
| `embeddingIds` | ``null`` \| `any`[] | `null` | ids of embeddings in the embeddings list |
| `similarityCutoff` | ``null`` \| `number` | `null` | minimum similarity score |

#### Returns

[`number`[], `any`[]]

#### Defined in

[Embedding.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L84)

___

### getTopKEmbeddingsLearner

▸ **getTopKEmbeddingsLearner**(`queryEmbedding`, `embeddings`, `similarityTopK?`, `embeddingsIds?`, `queryMode?`): [`number`[], `any`[]]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `queryEmbedding` | `number`[] | `undefined` |
| `embeddings` | `number`[][] | `undefined` |
| `similarityTopK?` | `number` | `undefined` |
| `embeddingsIds?` | `any`[] | `undefined` |
| `queryMode` | [`VectorStoreQueryMode`](enums/VectorStoreQueryMode.md) | `VectorStoreQueryMode.SVM` |

#### Returns

[`number`[], `any`[]]

#### Defined in

[Embedding.ts:126](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L126)

___

### getTopKMMREmbeddings

▸ **getTopKMMREmbeddings**(`queryEmbedding`, `embeddings`, `similarityFn?`, `similarityTopK?`, `embeddingIds?`, `_similarityCutoff?`, `mmrThreshold?`): [`number`[], `any`[]]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `queryEmbedding` | `number`[] | `undefined` |
| `embeddings` | `number`[][] | `undefined` |
| `similarityFn` | ``null`` \| (...`args`: `any`[]) => `number` | `null` |
| `similarityTopK` | ``null`` \| `number` | `null` |
| `embeddingIds` | ``null`` \| `any`[] | `null` |
| `_similarityCutoff` | ``null`` \| `number` | `null` |
| `mmrThreshold` | ``null`` \| `number` | `null` |

#### Returns

[`number`[], `any`[]]

#### Defined in

[Embedding.ts:138](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L138)

___

### jsonToIndexStruct

▸ **jsonToIndexStruct**(`json`): [`IndexStruct`](classes/IndexStruct.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `any` |

#### Returns

[`IndexStruct`](classes/IndexStruct.md)

#### Defined in

[indices/BaseIndex.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/indices/BaseIndex.ts#L73)

___

### jsonToNode

▸ **jsonToNode**(`json`): [`TextNode`](classes/TextNode.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `any` |

#### Returns

[`TextNode`](classes/TextNode.md)

#### Defined in

[Node.ts:271](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Node.ts#L271)

___

### messagesToHistoryStr

▸ **messagesToHistoryStr**(`messages`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](interfaces/ChatMessage.md)[] |

#### Returns

`string`

#### Defined in

[Prompt.ts:300](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Prompt.ts#L300)

___

### serviceContextFromDefaults

▸ **serviceContextFromDefaults**(`options?`): [`ServiceContext`](interfaces/ServiceContext.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | [`ServiceContextOptions`](interfaces/ServiceContextOptions.md) |

#### Returns

[`ServiceContext`](interfaces/ServiceContext.md)

#### Defined in

[ServiceContext.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/ServiceContext.ts#L30)

___

### serviceContextFromServiceContext

▸ **serviceContextFromServiceContext**(`serviceContext`, `options`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext` | [`ServiceContext`](interfaces/ServiceContext.md) |
| `options` | [`ServiceContextOptions`](interfaces/ServiceContextOptions.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `callbackManager` | [`CallbackManager`](classes/CallbackManager.md) |
| `embedModel` | [`BaseEmbedding`](classes/BaseEmbedding.md) |
| `llm` | [`LLM`](interfaces/LLM.md) |
| `nodeParser` | [`NodeParser`](interfaces/NodeParser.md) |
| `promptHelper` | `PromptHelper` |

#### Defined in

[ServiceContext.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/ServiceContext.ts#L48)

___

### similarity

▸ **similarity**(`embedding1`, `embedding2`, `mode?`): `number`

The similarity between two embeddings.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `embedding1` | `number`[] | `undefined` |
| `embedding2` | `number`[] | `undefined` |
| `mode` | [`SimilarityType`](enums/SimilarityType.md) | `SimilarityType.DEFAULT` |

#### Returns

`number`

similartiy score with higher numbers meaning the two embeddings are more similar

#### Defined in

[Embedding.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/Embedding.ts#L29)

___

### storageContextFromDefaults

▸ **storageContextFromDefaults**(`«destructured»`): `Promise`<[`StorageContext`](interfaces/StorageContext.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `BuilderParams` |

#### Returns

`Promise`<[`StorageContext`](interfaces/StorageContext.md)\>

#### Defined in

[storage/StorageContext.ts:28](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/StorageContext.ts#L28)

___

### walk

▸ **walk**(`fs`, `dirPath`): `AsyncIterable`<`string`\>

Recursively traverses a directory and yields all the paths to the files in it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fs` | [`WalkableFileSystem`](interfaces/WalkableFileSystem.md) | The filesystem to use. |
| `dirPath` | `string` | The path to the directory to traverse. |

#### Returns

`AsyncIterable`<`string`\>

#### Defined in

[storage/FileSystem.ts:91](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/storage/FileSystem.ts#L91)
