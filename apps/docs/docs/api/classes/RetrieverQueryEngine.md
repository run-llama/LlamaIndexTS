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

• **new RetrieverQueryEngine**(`retriever`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `retriever` | [`BaseRetriever`](../interfaces/BaseRetriever.md) |

#### Defined in

[QueryEngine.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/QueryEngine.ts#L29)

## Properties

### responseSynthesizer

• **responseSynthesizer**: [`ResponseSynthesizer`](ResponseSynthesizer.md)

#### Defined in

[QueryEngine.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/QueryEngine.ts#L27)

___

### retriever

• **retriever**: [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[QueryEngine.ts:26](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/QueryEngine.ts#L26)

## Methods

### aquery

▸ **aquery**(`query`, `parentEvent?`): `Promise`<[`Response`](Response.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[BaseQueryEngine](../interfaces/BaseQueryEngine.md).[aquery](../interfaces/BaseQueryEngine.md#aquery)

#### Defined in

[QueryEngine.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/QueryEngine.ts#L36)
