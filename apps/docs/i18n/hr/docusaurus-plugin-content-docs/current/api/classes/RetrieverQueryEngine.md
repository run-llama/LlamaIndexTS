---
id: "RetrieverQueryEngine"
title: "Class: RetrieverQueryEngine"
sidebar_label: "RetrieverQueryEngine"
sidebar_position: 0
custom_edit_url: null
---

A query engine that uses a retriever to query an index and then synthesizes the response.

## Implements

- [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

## Constructors

### constructor

• **new RetrieverQueryEngine**(`retriever`, `responseSynthesizer?`, `preFilters?`, `nodePostprocessors?`)

#### Parameters

| Name                   | Type                                                                |
| :--------------------- | :------------------------------------------------------------------ |
| `retriever`            | [`BaseRetriever`](../interfaces/BaseRetriever.md)                   |
| `responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md)                     |
| `preFilters?`          | `unknown`                                                           |
| `nodePostprocessors?`  | [`BaseNodePostprocessor`](../interfaces/BaseNodePostprocessor.md)[] |

#### Defined in

[packages/core/src/QueryEngine.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L37)

## Properties

### nodePostprocessors

• **nodePostprocessors**: [`BaseNodePostprocessor`](../interfaces/BaseNodePostprocessor.md)[]

#### Defined in

[packages/core/src/QueryEngine.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L34)

---

### preFilters

• `Optional` **preFilters**: `unknown`

#### Defined in

[packages/core/src/QueryEngine.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L35)

---

### responseSynthesizer

• **responseSynthesizer**: [`ResponseSynthesizer`](ResponseSynthesizer.md)

#### Defined in

[packages/core/src/QueryEngine.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L33)

---

### retriever

• **retriever**: [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[packages/core/src/QueryEngine.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L32)

## Methods

### applyNodePostprocessors

▸ `Private` **applyNodePostprocessors**(`nodes`): [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Parameters

| Name    | Type                                                                             |
| :------ | :------------------------------------------------------------------------------- |
| `nodes` | [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[] |

#### Returns

[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Defined in

[packages/core/src/QueryEngine.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L52)

---

### query

▸ **query**(`query`, `parentEvent?`): `Promise`<[`Response`](Response.md)\>

Query the query engine and get a response.

#### Parameters

| Name           | Type                              |
| :------------- | :-------------------------------- |
| `query`        | `string`                          |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[BaseQueryEngine](../interfaces/BaseQueryEngine.md).[query](../interfaces/BaseQueryEngine.md#query)

#### Defined in

[packages/core/src/QueryEngine.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L69)

---

### retrieve

▸ `Private` **retrieve**(`query`, `parentEvent`): `Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name          | Type                              |
| :------------ | :-------------------------------- |
| `query`       | `string`                          |
| `parentEvent` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/QueryEngine.ts:59](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/QueryEngine.ts#L59)
