---
id: "Refine"
title: "Class: Refine"
sidebar_label: "Refine"
sidebar_position: 0
custom_edit_url: null
---

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

[ResponseSynthesizer.ts:51](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L51)

## Properties

### refineTemplate

• **refineTemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:49](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L49)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:47](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L47)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:48](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L48)

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

[ResponseSynthesizer.ts:61](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L61)

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

[ResponseSynthesizer.ts:80](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L80)

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

[ResponseSynthesizer.ts:108](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L108)
