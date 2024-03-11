---
id: "PromptHelper"
title: "Class: PromptHelper"
sidebar_label: "PromptHelper"
sidebar_position: 0
custom_edit_url: null
---

A collection of helper functions for working with prompts.

## Constructors

### constructor

• **new PromptHelper**(`contextWindow?`, `numOutput?`, `chunkOverlapRatio?`, `chunkSizeLimit?`, `tokenizer?`, `separator?`)

#### Parameters

| Name                | Type                                | Default value                 |
| :------------------ | :---------------------------------- | :---------------------------- |
| `contextWindow`     | `number`                            | `DEFAULT_CONTEXT_WINDOW`      |
| `numOutput`         | `number`                            | `DEFAULT_NUM_OUTPUTS`         |
| `chunkOverlapRatio` | `number`                            | `DEFAULT_CHUNK_OVERLAP_RATIO` |
| `chunkSizeLimit?`   | `number`                            | `undefined`                   |
| `tokenizer?`        | (`text`: `string`) => `Uint32Array` | `undefined`                   |
| `separator`         | `string`                            | `" "`                         |

#### Defined in

[packages/core/src/PromptHelper.ts:40](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L40)

## Properties

### chunkOverlapRatio

• **chunkOverlapRatio**: `number` = `DEFAULT_CHUNK_OVERLAP_RATIO`

#### Defined in

[packages/core/src/PromptHelper.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L35)

---

### chunkSizeLimit

• `Optional` **chunkSizeLimit**: `number`

#### Defined in

[packages/core/src/PromptHelper.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L36)

---

### contextWindow

• **contextWindow**: `number` = `DEFAULT_CONTEXT_WINDOW`

#### Defined in

[packages/core/src/PromptHelper.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L33)

---

### numOutput

• **numOutput**: `number` = `DEFAULT_NUM_OUTPUTS`

#### Defined in

[packages/core/src/PromptHelper.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L34)

---

### separator

• **separator**: `string` = `" "`

#### Defined in

[packages/core/src/PromptHelper.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L38)

---

### tokenizer

• **tokenizer**: (`text`: `string`) => `Uint32Array`

#### Type declaration

▸ (`text`): `Uint32Array`

##### Parameters

| Name   | Type     |
| :----- | :------- |
| `text` | `string` |

##### Returns

`Uint32Array`

#### Defined in

[packages/core/src/PromptHelper.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L37)

## Methods

### getAvailableChunkSize

▸ `Private` **getAvailableChunkSize**(`prompt`, `numChunks?`, `padding?`): `number`

Find the maximum size of each chunk given a prompt.

#### Parameters

| Name        | Type                               | Default value |
| :---------- | :--------------------------------- | :------------ |
| `prompt`    | [`SimplePrompt`](../#simpleprompt) | `undefined`   |
| `numChunks` | `number`                           | `1`           |
| `padding`   | `number`                           | `5`           |

#### Returns

`number`

#### Defined in

[packages/core/src/PromptHelper.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L76)

---

### getAvailableContextSize

▸ `Private` **getAvailableContextSize**(`prompt`): `number`

Given a prompt, return the maximum size of the inputs to the prompt.

#### Parameters

| Name     | Type                               |
| :------- | :--------------------------------- |
| `prompt` | [`SimplePrompt`](../#simpleprompt) |

#### Returns

`number`

#### Defined in

[packages/core/src/PromptHelper.ts:61](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L61)

---

### getTextSplitterGivenPrompt

▸ **getTextSplitterGivenPrompt**(`prompt`, `numChunks?`, `padding?`): [`SentenceSplitter`](SentenceSplitter.md)

Creates a text splitter with the correct chunk sizes and overlaps given a prompt.

#### Parameters

| Name        | Type                               | Default value     |
| :---------- | :--------------------------------- | :---------------- |
| `prompt`    | [`SimplePrompt`](../#simpleprompt) | `undefined`       |
| `numChunks` | `number`                           | `1`               |
| `padding`   | `number`                           | `DEFAULT_PADDING` |

#### Returns

[`SentenceSplitter`](SentenceSplitter.md)

#### Defined in

[packages/core/src/PromptHelper.ts:99](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L99)

---

### repack

▸ **repack**(`prompt`, `textChunks`, `padding?`): `string`[]

Repack resplits the strings based on the optimal text splitter.

#### Parameters

| Name         | Type                               | Default value     |
| :----------- | :--------------------------------- | :---------------- |
| `prompt`     | [`SimplePrompt`](../#simpleprompt) | `undefined`       |
| `textChunks` | `string`[]                         | `undefined`       |
| `padding`    | `number`                           | `DEFAULT_PADDING` |

#### Returns

`string`[]

#### Defined in

[packages/core/src/PromptHelper.ts:120](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/PromptHelper.ts#L120)
