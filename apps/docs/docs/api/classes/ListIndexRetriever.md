---
id: "ListIndexRetriever"
title: "Class: ListIndexRetriever"
sidebar_label: "ListIndexRetriever"
sidebar_position: 0
custom_edit_url: null
---

Simple retriever for ListIndex that returns all nodes

## Implements

- [`BaseRetriever`](../interfaces/BaseRetriever.md)

## Constructors

### constructor

• **new ListIndexRetriever**(`index`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | [`ListIndex`](ListIndex.md) |

#### Defined in

[indices/list/ListIndexRetriever.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/list/ListIndexRetriever.ts#L22)

## Properties

### index

• **index**: [`ListIndex`](ListIndex.md)

#### Defined in

[indices/list/ListIndexRetriever.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/list/ListIndexRetriever.ts#L20)

## Methods

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[indices/list/ListIndexRetriever.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/list/ListIndexRetriever.ts#L48)

___

### retrieve

▸ **retrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[retrieve](../interfaces/BaseRetriever.md#retrieve)

#### Defined in

[indices/list/ListIndexRetriever.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/c65d671/packages/core/src/indices/list/ListIndexRetriever.ts#L26)
