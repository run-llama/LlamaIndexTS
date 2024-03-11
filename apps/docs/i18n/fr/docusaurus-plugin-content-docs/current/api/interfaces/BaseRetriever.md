---
id: "BaseRetriever"
title: "Interface: BaseRetriever"
sidebar_label: "BaseRetriever"
sidebar_position: 0
custom_edit_url: null
---

Retrievers retrieve the nodes that most closely match our query in similarity.

## Implemented by

- [`SummaryIndexLLMRetriever`](../classes/SummaryIndexLLMRetriever.md)
- [`SummaryIndexRetriever`](../classes/SummaryIndexRetriever.md)
- [`VectorIndexRetriever`](../classes/VectorIndexRetriever.md)

## Methods

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](ServiceContext.md)

#### Returns

[`ServiceContext`](ServiceContext.md)

#### Defined in

[packages/core/src/Retriever.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Retriever.ts#L14)

---

### retrieve

▸ **retrieve**(`query`, `parentEvent?`, `preFilters?`): `Promise`<[`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name           | Type                |
| :------------- | :------------------ |
| `query`        | `string`            |
| `parentEvent?` | [`Event`](Event.md) |
| `preFilters?`  | `unknown`           |

#### Returns

`Promise`<[`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/Retriever.ts:9](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/Retriever.ts#L9)
