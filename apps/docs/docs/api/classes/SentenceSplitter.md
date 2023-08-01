---
id: "SentenceSplitter"
title: "Class: SentenceSplitter"
sidebar_label: "SentenceSplitter"
sidebar_position: 0
custom_edit_url: null
---

SentenceSplitter is our default text splitter that supports splitting into sentences, paragraphs, or fixed length chunks with overlap.

One of the advantages of SentenceSplitter is that even in the fixed length chunks it will try to keep sentences together.

## Constructors

### constructor

• **new SentenceSplitter**(`chunkSize?`, `chunkOverlap?`, `tokenizer?`, `tokenizerDecoder?`, `paragraphSeparator?`, `chunkingTokenizerFn?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `chunkSize` | `number` | `DEFAULT_CHUNK_SIZE` |
| `chunkOverlap` | `number` | `DEFAULT_CHUNK_OVERLAP` |
| `tokenizer` | `any` | `null` |
| `tokenizerDecoder` | `any` | `null` |
| `paragraphSeparator` | `string` | `"\n\n\n"` |
| `chunkingTokenizerFn` | `any` | `undefined` |

#### Defined in

[TextSplitter.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L35)

## Properties

### chunkOverlap

• `Private` **chunkOverlap**: `number`

#### Defined in

[TextSplitter.ts:28](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L28)

___

### chunkSize

• `Private` **chunkSize**: `number`

#### Defined in

[TextSplitter.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L27)

___

### chunkingTokenizerFn

• `Private` **chunkingTokenizerFn**: `any`

#### Defined in

[TextSplitter.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L32)

___

### paragraphSeparator

• `Private` **paragraphSeparator**: `string`

#### Defined in

[TextSplitter.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L31)

___

### tokenizer

• `Private` **tokenizer**: `any`

#### Defined in

[TextSplitter.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L29)

___

### tokenizerDecoder

• `Private` **tokenizerDecoder**: `any`

#### Defined in

[TextSplitter.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L30)

## Methods

### combineTextSplits

▸ **combineTextSplits**(`newSentenceSplits`, `effectiveChunkSize`): `TextSplit`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `newSentenceSplits` | `SplitRep`[] |
| `effectiveChunkSize` | `number` |

#### Returns

`TextSplit`[]

#### Defined in

[TextSplitter.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L155)

___

### getEffectiveChunkSize

▸ `Private` **getEffectiveChunkSize**(`extraInfoStr?`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `extraInfoStr?` | `string` |

#### Returns

`number`

#### Defined in

[TextSplitter.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L74)

___

### getParagraphSplits

▸ **getParagraphSplits**(`text`, `effectiveChunkSize?`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `effectiveChunkSize?` | `number` |

#### Returns

`string`[]

#### Defined in

[TextSplitter.ts:91](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L91)

___

### getSentenceSplits

▸ **getSentenceSplits**(`text`, `effectiveChunkSize?`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `effectiveChunkSize?` | `number` |

#### Returns

`string`[]

#### Defined in

[TextSplitter.ts:117](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L117)

___

### processSentenceSplits

▸ `Private` **processSentenceSplits**(`sentenceSplits`, `effectiveChunkSize`): `SplitRep`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `sentenceSplits` | `string`[] |
| `effectiveChunkSize` | `number` |

#### Returns

`SplitRep`[]

#### Defined in

[TextSplitter.ts:130](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L130)

___

### splitText

▸ **splitText**(`text`, `extraInfoStr?`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `extraInfoStr?` | `string` |

#### Returns

`string`[]

#### Defined in

[TextSplitter.ts:247](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L247)

___

### splitTextWithOverlaps

▸ **splitTextWithOverlaps**(`text`, `extraInfoStr?`): `TextSplit`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |
| `extraInfoStr?` | `string` |

#### Returns

`TextSplit`[]

#### Defined in

[TextSplitter.ts:219](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/TextSplitter.ts#L219)
