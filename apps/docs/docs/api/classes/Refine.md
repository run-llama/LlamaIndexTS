---
id: "Refine"
title: "Class: Refine"
sidebar_label: "Refine"
sidebar_position: 0
custom_edit_url: null
---

A response builder that uses the query to ask the LLM generate a better response using multiple text chunks.

## Hierarchy

- **`Refine`**

  ↳ [`CompactAndRefine`](CompactAndRefine.md)

## Implements

- `BaseResponseBuilder`

## Constructors

### constructor

• **new Refine**(`serviceContext`, `textQATemplate?`, `refineTemplate?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |
| `textQATemplate?` | [`SimplePrompt`](../modules.md#simpleprompt) |
| `refineTemplate?` | [`SimplePrompt`](../modules.md#simpleprompt) |

#### Defined in

[ResponseSynthesizer.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/ResponseSynthesizer.ts#L78)

## Properties

### refineTemplate

• **refineTemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/ResponseSynthesizer.ts#L76)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/ResponseSynthesizer.ts#L74)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/ResponseSynthesizer.ts#L75)

## Methods

### getResponse

▸ **getResponse**(`query`, `textChunks`, `parentEvent?`, `prevResponse?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |
| `prevResponse?` | `string` |

#### Returns

`Promise`<`string`\>

#### Implementation of

BaseResponseBuilder.getResponse

#### Defined in

[ResponseSynthesizer.ts:88](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/ResponseSynthesizer.ts#L88)

___

### giveResponseSingle

▸ `Private` **giveResponseSingle**(`queryStr`, `textChunk`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryStr` | `string` |
| `textChunk` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[ResponseSynthesizer.ts:113](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/ResponseSynthesizer.ts#L113)

___

### refineResponseSingle

▸ `Private` **refineResponseSingle**(`response`, `queryStr`, `textChunk`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | `string` |
| `queryStr` | `string` |
| `textChunk` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[ResponseSynthesizer.ts:149](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/ResponseSynthesizer.ts#L149)
