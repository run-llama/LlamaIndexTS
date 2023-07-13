---
id: "TreeSummarize"
title: "Class: TreeSummarize"
sidebar_label: "TreeSummarize"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- `BaseResponseBuilder`

## Constructors

### constructor

• **new TreeSummarize**(`serviceContext`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[ResponseSynthesizer.ts:156](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L156)

## Properties

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:154](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L154)

## Methods

### agetResponse

▸ **agetResponse**(`query`, `textChunks`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |

#### Returns

`Promise`<`string`\>

#### Implementation of

BaseResponseBuilder.agetResponse

#### Defined in

[ResponseSynthesizer.ts:160](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L160)
