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

• **new SentenceSplitter**(`options?`)

#### Parameters

| Name                           | Type                                               |
| :----------------------------- | :------------------------------------------------- |
| `options?`                     | `Object`                                           |
| `options.chunkOverlap?`        | `number`                                           |
| `options.chunkSize?`           | `number`                                           |
| `options.chunkingTokenizerFn?` | (`text`: `string`) => `null` \| `RegExpMatchArray` |
| `options.paragraphSeparator?`  | `string`                                           |
| `options.splitLongSentences?`  | `boolean`                                          |
| `options.tokenizer?`           | `any`                                              |
| `options.tokenizerDecoder?`    | `any`                                              |

#### Defined in

[packages/core/src/TextSplitter.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L67)

## Properties

### chunkOverlap

• `Private` **chunkOverlap**: `number`

#### Defined in

[packages/core/src/TextSplitter.ts:60](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L60)

---

### chunkSize

• `Private` **chunkSize**: `number`

#### Defined in

[packages/core/src/TextSplitter.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L59)

---

### chunkingTokenizerFn

• `Private` **chunkingTokenizerFn**: (`text`: `string`) => `null` \| `RegExpMatchArray`

#### Type declaration

▸ (`text`): `null` \| `RegExpMatchArray`

##### Parameters

| Name   | Type     |
| :----- | :------- |
| `text` | `string` |

##### Returns

`null` \| `RegExpMatchArray`

#### Defined in

[packages/core/src/TextSplitter.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L64)

---

### paragraphSeparator

• `Private` **paragraphSeparator**: `string`

#### Defined in

[packages/core/src/TextSplitter.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L63)

---

### splitLongSentences

• `Private` **splitLongSentences**: `boolean`

#### Defined in

[packages/core/src/TextSplitter.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L65)

---

### tokenizer

• `Private` **tokenizer**: `any`

#### Defined in

[packages/core/src/TextSplitter.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L61)

---

### tokenizerDecoder

• `Private` **tokenizerDecoder**: `any`

#### Defined in

[packages/core/src/TextSplitter.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L62)

## Methods

### combineTextSplits

▸ **combineTextSplits**(`newSentenceSplits`, `effectiveChunkSize`): `TextSplit`[]

#### Parameters

| Name                 | Type         |
| :------------------- | :----------- |
| `newSentenceSplits`  | `SplitRep`[] |
| `effectiveChunkSize` | `number`     |

#### Returns

`TextSplit`[]

#### Defined in

[packages/core/src/TextSplitter.ts:205](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L205)

---

### getEffectiveChunkSize

▸ `Private` **getEffectiveChunkSize**(`extraInfoStr?`): `number`

#### Parameters

| Name            | Type     |
| :-------------- | :------- |
| `extraInfoStr?` | `string` |

#### Returns

`number`

#### Defined in

[packages/core/src/TextSplitter.ts:104](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L104)

---

### getParagraphSplits

▸ **getParagraphSplits**(`text`, `effectiveChunkSize?`): `string`[]

#### Parameters

| Name                  | Type     |
| :-------------------- | :------- |
| `text`                | `string` |
| `effectiveChunkSize?` | `number` |

#### Returns

`string`[]

#### Defined in

[packages/core/src/TextSplitter.ts:121](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L121)

---

### getSentenceSplits

▸ **getSentenceSplits**(`text`, `effectiveChunkSize?`): `string`[]

#### Parameters

| Name                  | Type     |
| :-------------------- | :------- |
| `text`                | `string` |
| `effectiveChunkSize?` | `number` |

#### Returns

`string`[]

#### Defined in

[packages/core/src/TextSplitter.ts:147](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L147)

---

### processSentenceSplits

▸ `Private` **processSentenceSplits**(`sentenceSplits`, `effectiveChunkSize`): `SplitRep`[]

Splits sentences into chunks if necessary.

This isn't great behavior because it can split down the middle of a
word or in non-English split down the middle of a Unicode codepoint
so the splitting is turned off by default. If you need it, please
set the splitLongSentences option to true.

#### Parameters

| Name                 | Type       |
| :------------------- | :--------- |
| `sentenceSplits`     | `string`[] |
| `effectiveChunkSize` | `number`   |

#### Returns

`SplitRep`[]

#### Defined in

[packages/core/src/TextSplitter.ts:176](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L176)

---

### splitText

▸ **splitText**(`text`, `extraInfoStr?`): `string`[]

#### Parameters

| Name            | Type     |
| :-------------- | :------- |
| `text`          | `string` |
| `extraInfoStr?` | `string` |

#### Returns

`string`[]

#### Defined in

[packages/core/src/TextSplitter.ts:297](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L297)

---

### splitTextWithOverlaps

▸ **splitTextWithOverlaps**(`text`, `extraInfoStr?`): `TextSplit`[]

#### Parameters

| Name            | Type     |
| :-------------- | :------- |
| `text`          | `string` |
| `extraInfoStr?` | `string` |

#### Returns

`TextSplit`[]

#### Defined in

[packages/core/src/TextSplitter.ts:269](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/TextSplitter.ts#L269)
