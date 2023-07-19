---
id: "ResponseSynthesizer"
title: "Class: ResponseSynthesizer"
sidebar_label: "ResponseSynthesizer"
sidebar_position: 0
custom_edit_url: null
---

A ResponseSynthesizer is used to generate a response from a query and a list of nodes.

## Constructors

### constructor

• **new ResponseSynthesizer**(`«destructured»?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `responseBuilder?` | `BaseResponseBuilder` |
| › `serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[ResponseSynthesizer.ts:279](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ResponseSynthesizer.ts#L279)

## Properties

### responseBuilder

• **responseBuilder**: `BaseResponseBuilder`

#### Defined in

[ResponseSynthesizer.ts:276](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ResponseSynthesizer.ts#L276)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:277](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ResponseSynthesizer.ts#L277)

## Methods

### synthesize

▸ **synthesize**(`query`, `nodes`, `parentEvent?`): `Promise`<[`Response`](Response.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `nodes` | [`NodeWithScore`](../interfaces/NodeWithScore.md)[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Defined in

[ResponseSynthesizer.ts:291](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ResponseSynthesizer.ts#L291)
