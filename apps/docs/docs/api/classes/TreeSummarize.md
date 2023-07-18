---
id: "TreeSummarize"
title: "Class: TreeSummarize"
sidebar_label: "TreeSummarize"
sidebar_position: 0
custom_edit_url: null
---

TreeSummarize repacks the text chunks into the smallest possible number of chunks and then summarizes them, then recursively does so until there's one chunk left.

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

[ResponseSynthesizer.ts:177](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L177)

## Properties

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:175](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L175)

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

[ResponseSynthesizer.ts:181](https://github.com/run-llama/LlamaIndexTS/blob/b6b2598/packages/core/src/ResponseSynthesizer.ts#L181)
