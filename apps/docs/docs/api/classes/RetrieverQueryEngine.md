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

• **new RetrieverQueryEngine**(`retriever`, `responseSynthesizer?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `retriever` | [`BaseRetriever`](../interfaces/BaseRetriever.md) |
| `responseSynthesizer?` | [`ResponseSynthesizer`](ResponseSynthesizer.md) |

#### Defined in

[QueryEngine.ts:34](https://github.com/run-llama/LlamaIndexTS/blob/50c0b04/packages/core/src/QueryEngine.ts#L34)

## Properties

### responseSynthesizer

• **responseSynthesizer**: [`ResponseSynthesizer`](ResponseSynthesizer.md)

#### Defined in

[QueryEngine.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/50c0b04/packages/core/src/QueryEngine.ts#L32)

___

### retriever

• **retriever**: [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[QueryEngine.ts:31](https://github.com/run-llama/LlamaIndexTS/blob/50c0b04/packages/core/src/QueryEngine.ts#L31)

## Methods

### query

▸ **query**(`query`, `parentEvent?`): `Promise`<[`Response`](Response.md)\>

Query the query engine and get a response.

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[BaseQueryEngine](../interfaces/BaseQueryEngine.md).[query](../interfaces/BaseQueryEngine.md#query)

#### Defined in

[QueryEngine.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/50c0b04/packages/core/src/QueryEngine.ts#L45)
