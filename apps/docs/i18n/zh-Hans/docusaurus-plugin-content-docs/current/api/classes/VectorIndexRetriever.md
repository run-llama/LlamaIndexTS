---
id: "VectorIndexRetriever"
title: "Class: VectorIndexRetriever"
sidebar_label: "VectorIndexRetriever"
sidebar_position: 0
custom_edit_url: null
---

VectorIndexRetriever retrieves nodes from a VectorIndex.

## Implements

- [`BaseRetriever`](../interfaces/BaseRetriever.md)

## Constructors

### constructor

• **new VectorIndexRetriever**(`«destructured»`)

#### Parameters

| Name                | Type                                      |
| :------------------ | :---------------------------------------- |
| `«destructured»`    | `Object`                                  |
| › `index`           | [`VectorStoreIndex`](VectorStoreIndex.md) |
| › `similarityTopK?` | `number`                                  |

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:24](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L24)

## Properties

### index

• **index**: [`VectorStoreIndex`](VectorStoreIndex.md)

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L20)

---

### serviceContext

• `Private` **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L22)

---

### similarityTopK

• **similarityTopK**: `number`

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L21)

## Methods

### buildNodeListFromQueryResult

▸ `Protected` **buildNodeListFromQueryResult**(`result`): [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Parameters

| Name     | Type                                                                |
| :------- | :------------------------------------------------------------------ |
| `result` | [`VectorStoreQueryResult`](../interfaces/VectorStoreQueryResult.md) |

#### Returns

[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:102](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L102)

---

### buildVectorStoreQuery

▸ `Protected` **buildVectorStoreQuery**(`embedModel`, `query`): `Promise`<[`VectorStoreQuery`](../interfaces/VectorStoreQuery.md)\>

#### Parameters

| Name         | Type                                |
| :----------- | :---------------------------------- |
| `embedModel` | [`BaseEmbedding`](BaseEmbedding.md) |
| `query`      | `string`                            |

#### Returns

`Promise`<[`VectorStoreQuery`](../interfaces/VectorStoreQuery.md)\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:89](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L89)

---

### getServiceContext

▸ **getServiceContext**(): [`ServiceContext`](../interfaces/ServiceContext.md)

#### Returns

[`ServiceContext`](../interfaces/ServiceContext.md)

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[getServiceContext](../interfaces/BaseRetriever.md#getservicecontext)

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:120](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L120)

---

### retrieve

▸ **retrieve**(`query`, `parentEvent?`, `preFilters?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `query`        | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |
| `preFilters?`  | `unknown`                         |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Implementation of

[BaseRetriever](../interfaces/BaseRetriever.md).[retrieve](../interfaces/BaseRetriever.md#retrieve)

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L37)

---

### sendEvent

▸ `Protected` **sendEvent**(`query`, `nodesWithScores`, `parentEvent`): `void`

#### Parameters

| Name              | Type                                                                             |
| :---------------- | :------------------------------------------------------------------------------- |
| `query`           | `string`                                                                         |
| `nodesWithScores` | [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[] |
| `parentEvent`     | `undefined` \| [`Event`](../interfaces/Event.md)                                 |

#### Returns

`void`

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L72)

---

### textRetrieve

▸ `Protected` **textRetrieve**(`query`, `preFilters?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name          | Type      |
| :------------ | :-------- |
| `query`       | `string`  |
| `preFilters?` | `unknown` |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:50](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L50)

---

### textToImageRetrieve

▸ `Private` **textToImageRetrieve**(`query`, `preFilters?`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name          | Type      |
| :------------ | :-------- |
| `query`       | `string`  |
| `preFilters?` | `unknown` |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/indices/vectorStore/VectorIndexRetriever.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/indices/vectorStore/VectorIndexRetriever.ts#L59)
