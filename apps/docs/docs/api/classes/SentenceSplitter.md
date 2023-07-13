---
id: "SentenceSplitter"
title: "Class: SentenceSplitter"
sidebar_label: "SentenceSplitter"
sidebar_position: 0
custom_edit_url: null
---

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

[TextSplitter.ts:30](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L30)

## Properties

### chunkOverlap

• `Private` **chunkOverlap**: `number`

#### Defined in

[TextSplitter.ts:23](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L23)

___

### chunkSize

• `Private` **chunkSize**: `number`

#### Defined in

[TextSplitter.ts:22](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L22)

___

### chunkingTokenizerFn

• `Private` **chunkingTokenizerFn**: `any`

#### Defined in

[TextSplitter.ts:27](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L27)

___

### paragraphSeparator

• `Private` **paragraphSeparator**: `string`

#### Defined in

[TextSplitter.ts:26](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L26)

___

### tokenizer

• `Private` **tokenizer**: `any`

#### Defined in

[TextSplitter.ts:24](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L24)

___

### tokenizerDecoder

• `Private` **tokenizerDecoder**: `any`

#### Defined in

[TextSplitter.ts:25](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L25)

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

[TextSplitter.ts:150](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L150)

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

[TextSplitter.ts:69](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L69)

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

[TextSplitter.ts:86](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L86)

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

[TextSplitter.ts:112](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L112)

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

[TextSplitter.ts:125](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L125)

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

[TextSplitter.ts:230](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L230)

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

[TextSplitter.ts:202](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/TextSplitter.ts#L202)
