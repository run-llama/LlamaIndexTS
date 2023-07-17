---
id: "SentenceSplitter"
title: "Class: SentenceSplitter"
sidebar_label: "SentenceSplitter"
sidebar_position: 0
custom_edit_url: null
---

SentenceSplitter is our default text splitter that supports splitting into sentences, paragraphs, or fixed length chunks with overlap.

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

[TextSplitter.ts:33](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L33)

## Properties

### chunkOverlap

• `Private` **chunkOverlap**: `number`

#### Defined in

[TextSplitter.ts:26](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L26)

___

### chunkSize

• `Private` **chunkSize**: `number`

#### Defined in

[TextSplitter.ts:25](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L25)

___

### chunkingTokenizerFn

• `Private` **chunkingTokenizerFn**: `any`

#### Defined in

[TextSplitter.ts:30](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L30)

___

### paragraphSeparator

• `Private` **paragraphSeparator**: `string`

#### Defined in

[TextSplitter.ts:29](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L29)

___

### tokenizer

• `Private` **tokenizer**: `any`

#### Defined in

[TextSplitter.ts:27](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L27)

___

### tokenizerDecoder

• `Private` **tokenizerDecoder**: `any`

#### Defined in

[TextSplitter.ts:28](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L28)

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

[TextSplitter.ts:153](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L153)

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

[TextSplitter.ts:72](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L72)

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

[TextSplitter.ts:89](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L89)

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

[TextSplitter.ts:115](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L115)

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

[TextSplitter.ts:128](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L128)

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

[TextSplitter.ts:233](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L233)

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

[TextSplitter.ts:205](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/TextSplitter.ts#L205)
