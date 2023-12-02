---
id: "SummaryIndexRetriever"
title: "Class: SummaryIndexRetriever"
sidebar_label: "SummaryIndexRetriever"
sidebar_position: 0
custom_edit_url: null
---

Simple retriever for SummaryIndex that returns all nodes

## Implements

- [`BaseRetriever`](../interfaces/BaseRetriever.md)

## Constructors

### constructor

• **new SummaryIndexRetriever**(`index`)

#### Parameters

| Name    | Type                              |
| :------ | :-------------------------------- |
| `index` | [`SummaryIndex`](SummaryIndex.md) |

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L22)

## Properties

### index

• **index**: [`SummaryIndex`](SummaryIndex.md)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L20)

## Methods

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L48)

---

### retrieve

▸ **retrieve**(`query`, `parentEvent?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `query`        | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[retrieve](../interfaces/BaseRetriever.md#retrieve)

#### Defined in

[packages/core/src/indices/summary/SummaryIndexRetriever.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/summary/SummaryIndexRetriever.ts#L26)
