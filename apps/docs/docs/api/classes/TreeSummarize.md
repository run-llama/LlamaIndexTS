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

[ResponseSynthesizer.ts:212](https://github.com/run-llama/LlamaIndexTS/blob/3fda1de/packages/core/src/ResponseSynthesizer.ts#L212)

## Properties

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:210](https://github.com/run-llama/LlamaIndexTS/blob/3fda1de/packages/core/src/ResponseSynthesizer.ts#L210)

## Methods

### getResponse

▸ **getResponse**(`query`, `textChunks`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Implementation of

BaseResponseBuilder.getResponse

#### Defined in

[ResponseSynthesizer.ts:216](https://github.com/run-llama/LlamaIndexTS/blob/3fda1de/packages/core/src/ResponseSynthesizer.ts#L216)
