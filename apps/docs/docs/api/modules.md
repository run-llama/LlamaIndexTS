---
id: "modules"
title: "@llamaindex/core"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Enumerations

- [ListRetrieverMode](enums/ListRetrieverMode.md)
- [MetadataMode](enums/MetadataMode.md)
- [NodeRelationship](enums/NodeRelationship.md)
- [ObjectType](enums/ObjectType.md)
- [SimilarityType](enums/SimilarityType.md)

## Classes

- [BaseEmbedding](classes/BaseEmbedding.md)
- [BaseIndex](classes/BaseIndex.md)
- [BaseNode](classes/BaseNode.md)
- [CallbackManager](classes/CallbackManager.md)
- [ChatGPTLLMPredictor](classes/ChatGPTLLMPredictor.md)
- [CompactAndRefine](classes/CompactAndRefine.md)
- [CondenseQuestionChatEngine](classes/CondenseQuestionChatEngine.md)
- [ContextChatEngine](classes/ContextChatEngine.md)
- [Document](classes/Document.md)
- [ImageDocument](classes/ImageDocument.md)
- [ImageNode](classes/ImageNode.md)
- [InMemoryFileSystem](classes/InMemoryFileSystem.md)
- [IndexDict](classes/IndexDict.md)
- [IndexList](classes/IndexList.md)
- [IndexNode](classes/IndexNode.md)
- [IndexStruct](classes/IndexStruct.md)
- [LLMQuestionGenerator](classes/LLMQuestionGenerator.md)
- [ListIndex](classes/ListIndex.md)
- [ListIndexLLMRetriever](classes/ListIndexLLMRetriever.md)
- [ListIndexRetriever](classes/ListIndexRetriever.md)
- [OpenAI](classes/OpenAI.md)
- [OpenAIEmbedding](classes/OpenAIEmbedding.md)
- [Refine](classes/Refine.md)
- [Response](classes/Response.md)
- [ResponseSynthesizer](classes/ResponseSynthesizer.md)
- [SentenceSplitter](classes/SentenceSplitter.md)
- [SimpleChatEngine](classes/SimpleChatEngine.md)
- [SimpleNodeParser](classes/SimpleNodeParser.md)
- [SimpleResponseBuilder](classes/SimpleResponseBuilder.md)
- [SubQuestionOutputParser](classes/SubQuestionOutputParser.md)
- [TextFileReader](classes/TextFileReader.md)
- [TextNode](classes/TextNode.md)
- [TreeSummarize](classes/TreeSummarize.md)
- [VectorIndexRetriever](classes/VectorIndexRetriever.md)
- [VectorStoreIndex](classes/VectorStoreIndex.md)

## Interfaces

- [BaseIndexInit](interfaces/BaseIndexInit.md)
- [BaseLLMPredictor](interfaces/BaseLLMPredictor.md)
- [BaseOutputParser](interfaces/BaseOutputParser.md)
- [BaseQuestionGenerator](interfaces/BaseQuestionGenerator.md)
- [BaseReader](interfaces/BaseReader.md)
- [BaseRetriever](interfaces/BaseRetriever.md)
- [BaseTool](interfaces/BaseTool.md)
- [ChatMessage](interfaces/ChatMessage.md)
- [ChatResponse](interfaces/ChatResponse.md)
- [Event](interfaces/Event.md)
- [GenericFileSystem](interfaces/GenericFileSystem.md)
- [LLM](interfaces/LLM.md)
- [NodeParser](interfaces/NodeParser.md)
- [NodeWithEmbedding](interfaces/NodeWithEmbedding.md)
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
- [VectorIndexOptions](interfaces/VectorIndexOptions.md)
- [WalkableFileSystem](interfaces/WalkableFileSystem.md)

## Type Aliases

### CompleteFileSystem

Ƭ **CompleteFileSystem**: [`GenericFileSystem`](interfaces/GenericFileSystem.md) & [`WalkableFileSystem`](interfaces/WalkableFileSystem.md)

#### Defined in

[storage/FileSystem.ts:49](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/FileSystem.ts#L49)

___

### CompletionResponse

Ƭ **CompletionResponse**: [`ChatResponse`](interfaces/ChatResponse.md)

#### Defined in

[LLM.ts:25](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L25)

___

### EventTag

Ƭ **EventTag**: ``"intermediate"`` \| ``"final"``

#### Defined in

[callbacks/CallbackManager.ts:11](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/callbacks/CallbackManager.ts#L11)

___

### EventType

Ƭ **EventType**: ``"retrieve"`` \| ``"llmPredict"`` \| ``"wrapper"``

#### Defined in

[callbacks/CallbackManager.ts:12](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/callbacks/CallbackManager.ts#L12)

___

### RelatedNodeType

Ƭ **RelatedNodeType**: [`RelatedNodeInfo`](interfaces/RelatedNodeInfo.md) \| [`RelatedNodeInfo`](interfaces/RelatedNodeInfo.md)[]

#### Defined in

[Node.ts:32](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Node.ts#L32)

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

[readers/SimpleDirectoryReader.ts:23](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/readers/SimpleDirectoryReader.ts#L23)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

## Variables

### ALL\_AVAILABLE\_MODELS

• `Const` **ALL\_AVAILABLE\_MODELS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `gpt-3.5-turbo` | `number` |
| `gpt-3.5-turbo-16k` | `number` |
| `gpt-4` | `number` |
| `gpt-4-32k` | `number` |

#### Defined in

[LLM.ts:42](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L42)

___

### DEFAULT\_CHUNK\_OVERLAP

• `Const` **DEFAULT\_CHUNK\_OVERLAP**: ``20``

#### Defined in

[constants.ts:5](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L5)

___

### DEFAULT\_CHUNK\_OVERLAP\_RATIO

• `Const` **DEFAULT\_CHUNK\_OVERLAP\_RATIO**: ``0.1``

#### Defined in

[constants.ts:6](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L6)

___

### DEFAULT\_CHUNK\_SIZE

• `Const` **DEFAULT\_CHUNK\_SIZE**: ``1024``

#### Defined in

[constants.ts:4](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L4)

___

### DEFAULT\_COLLECTION

• `Const` **DEFAULT\_COLLECTION**: ``"data"``

#### Defined in

[storage/constants.ts:1](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/constants.ts#L1)

___

### DEFAULT\_CONTEXT\_WINDOW

• `Const` **DEFAULT\_CONTEXT\_WINDOW**: ``3900``

#### Defined in

[constants.ts:1](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L1)

___

### DEFAULT\_DOC\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_DOC\_STORE\_PERSIST\_FILENAME**: ``"docstore.json"``

#### Defined in

[storage/constants.ts:4](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/constants.ts#L4)

___

### DEFAULT\_EMBEDDING\_DIM

• `Const` **DEFAULT\_EMBEDDING\_DIM**: ``1536``

#### Defined in

[constants.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L10)

___

### DEFAULT\_FS

• `Const` **DEFAULT\_FS**: [`GenericFileSystem`](interfaces/GenericFileSystem.md) \| [`CompleteFileSystem`](modules.md#completefilesystem)

#### Defined in

[storage/FileSystem.ts:62](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/FileSystem.ts#L62)

___

### DEFAULT\_GRAPH\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_GRAPH\_STORE\_PERSIST\_FILENAME**: ``"graph_store.json"``

#### Defined in

[storage/constants.ts:6](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/constants.ts#L6)

___

### DEFAULT\_INDEX\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_INDEX\_STORE\_PERSIST\_FILENAME**: ``"index_store.json"``

#### Defined in

[storage/constants.ts:3](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/constants.ts#L3)

___

### DEFAULT\_NAMESPACE

• `Const` **DEFAULT\_NAMESPACE**: ``"docstore"``

#### Defined in

[storage/constants.ts:7](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/constants.ts#L7)

___

### DEFAULT\_NUM\_OUTPUTS

• `Const` **DEFAULT\_NUM\_OUTPUTS**: ``256``

#### Defined in

[constants.ts:2](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L2)

___

### DEFAULT\_PADDING

• `Const` **DEFAULT\_PADDING**: ``5``

#### Defined in

[constants.ts:11](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L11)

___

### DEFAULT\_PERSIST\_DIR

• `Const` **DEFAULT\_PERSIST\_DIR**: ``"./storage"``

#### Defined in

[storage/constants.ts:2](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/constants.ts#L2)

___

### DEFAULT\_SIMILARITY\_TOP\_K

• `Const` **DEFAULT\_SIMILARITY\_TOP\_K**: ``2``

#### Defined in

[constants.ts:7](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/constants.ts#L7)

___

### DEFAULT\_VECTOR\_STORE\_PERSIST\_FILENAME

• `Const` **DEFAULT\_VECTOR\_STORE\_PERSIST\_FILENAME**: ``"vector_store.json"``

#### Defined in

[storage/constants.ts:5](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/constants.ts#L5)

___

### GPT4\_MODELS

• `Const` **GPT4\_MODELS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `gpt-4` | `number` |
| `gpt-4-32k` | `number` |

#### Defined in

[LLM.ts:32](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L32)

___

### TURBO\_MODELS

• `Const` **TURBO\_MODELS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `gpt-3.5-turbo` | `number` |
| `gpt-3.5-turbo-16k` | `number` |

#### Defined in

[LLM.ts:37](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L37)

___

### globalsHelper

• `Const` **globalsHelper**: `GlobalsHelper`

#### Defined in

[GlobalsHelper.ts:39](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/GlobalsHelper.ts#L39)

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

[Prompt.ts:198](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L198)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

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

[Prompt.ts:10](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L10)

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

[storage/FileSystem.ts:74](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/FileSystem.ts#L74)

___

### getNodeFS

▸ **getNodeFS**(): [`CompleteFileSystem`](modules.md#completefilesystem)

#### Returns

[`CompleteFileSystem`](modules.md#completefilesystem)

#### Defined in

[storage/FileSystem.ts:51](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/FileSystem.ts#L51)

___

### getNodesFromDocument

▸ **getNodesFromDocument**(`document`, `textSplitter`, `includeMetadata?`, `includePrevNextRel?`): [`TextNode`](classes/TextNode.md)[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `document` | [`Document`](classes/Document.md) | `undefined` |
| `textSplitter` | [`SentenceSplitter`](classes/SentenceSplitter.md) | `undefined` |
| `includeMetadata` | `boolean` | `true` |
| `includePrevNextRel` | `boolean` | `true` |

#### Returns

[`TextNode`](classes/TextNode.md)[]

#### Defined in

[NodeParser.ts:15](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L15)

___

### getResponseBuilder

▸ **getResponseBuilder**(`serviceContext?`): [`SimpleResponseBuilder`](classes/SimpleResponseBuilder.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext?` | [`ServiceContext`](interfaces/ServiceContext.md) |

#### Returns

[`SimpleResponseBuilder`](classes/SimpleResponseBuilder.md)

#### Defined in

[ResponseSynthesizer.ts:191](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L191)

___

### getTextSplitsFromDocument

▸ **getTextSplitsFromDocument**(`document`, `textSplitter`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | [`Document`](classes/Document.md) |
| `textSplitter` | [`SentenceSplitter`](classes/SentenceSplitter.md) |

#### Returns

`string`[]

#### Defined in

[NodeParser.ts:5](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/NodeParser.ts#L5)

___

### getTopKEmbeddings

▸ **getTopKEmbeddings**(`queryEmbedding`, `embeddings`, `similarityTopK?`, `embeddingIds?`, `similarityCutoff?`): [`number`[], `any`[]]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `queryEmbedding` | `number`[] | `undefined` |
| `embeddings` | `number`[][] | `undefined` |
| `similarityTopK` | `number` | `DEFAULT_SIMILARITY_TOP_K` |
| `embeddingIds` | ``null`` \| `any`[] | `null` |
| `similarityCutoff` | ``null`` \| `number` | `null` |

#### Returns

[`number`[], `any`[]]

#### Defined in

[Embedding.ts:57](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L57)

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
| `queryMode` | `VectorStoreQueryMode` | `VectorStoreQueryMode.SVM` |

#### Returns

[`number`[], `any`[]]

#### Defined in

[Embedding.ts:99](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L99)

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

[Embedding.ts:111](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L111)

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

[Prompt.ts:300](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Prompt.ts#L300)

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

[ServiceContext.ts:29](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ServiceContext.ts#L29)

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
| `llmPredictor` | [`BaseLLMPredictor`](interfaces/BaseLLMPredictor.md) |
| `nodeParser` | [`NodeParser`](interfaces/NodeParser.md) |
| `promptHelper` | `PromptHelper` |

#### Defined in

[ServiceContext.ts:49](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ServiceContext.ts#L49)

___

### similarity

▸ **similarity**(`embedding1`, `embedding2`, `mode?`): `number`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `embedding1` | `number`[] | `undefined` |
| `embedding2` | `number`[] | `undefined` |
| `mode` | [`SimilarityType`](enums/SimilarityType.md) | `SimilarityType.DEFAULT` |

#### Returns

`number`

#### Defined in

[Embedding.ts:11](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/Embedding.ts#L11)

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

[storage/StorageContext.ts:28](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/StorageContext.ts#L28)

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

[storage/FileSystem.ts:91](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/storage/FileSystem.ts#L91)
