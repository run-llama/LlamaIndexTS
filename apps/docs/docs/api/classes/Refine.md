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

[ResponseSynthesizer.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L66)

## Properties

### refineTemplate

• **refineTemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L64)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:62](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L62)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L63)

## Methods

### agetResponse

▸ **agetResponse**(`query`, `textChunks`, `prevResponse?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |
| `prevResponse?` | `any` |

#### Returns

`Promise`<`string`\>

#### Implementation of

BaseResponseBuilder.agetResponse

#### Defined in

[ResponseSynthesizer.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L76)

___

### giveResponseSingle

▸ `Private` **giveResponseSingle**(`queryStr`, `textChunk`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `queryStr` | `string` |
| `textChunk` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[ResponseSynthesizer.ts:95](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L95)

___

### refineResponseSingle

▸ `Private` **refineResponseSingle**(`response`, `queryStr`, `textChunk`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `response` | `string` |
| `queryStr` | `string` |
| `textChunk` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[ResponseSynthesizer.ts:123](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L123)
