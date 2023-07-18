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

[index/list/ListIndexRetriever.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/index/list/ListIndexRetriever.ts#L22)

## Properties

### index

• **index**: [`ListIndex`](ListIndex.md)

#### Defined in

[index/list/ListIndexRetriever.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/index/list/ListIndexRetriever.ts#L20)

## Methods

### aretrieve

▸ **aretrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[aretrieve](../interfaces/BaseRetriever.md#aretrieve)

#### Defined in

[index/list/ListIndexRetriever.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/index/list/ListIndexRetriever.ts#L26)

___

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[index/list/ListIndexRetriever.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/f9f6dc6/packages/core/src/index/list/ListIndexRetriever.ts#L51)
