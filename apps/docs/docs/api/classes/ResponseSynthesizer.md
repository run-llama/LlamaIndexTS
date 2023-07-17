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

[ResponseSynthesizer.ts:225](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/ResponseSynthesizer.ts#L225)

## Properties

### responseBuilder

• **responseBuilder**: `BaseResponseBuilder`

#### Defined in

[ResponseSynthesizer.ts:222](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/ResponseSynthesizer.ts#L222)

___

### serviceContext

• `Optional` **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:223](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/ResponseSynthesizer.ts#L223)

## Methods

### asynthesize

▸ **asynthesize**(`query`, `nodes`, `parentEvent?`): `Promise`<[`Response`](Response.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `nodes` | [`NodeWithScore`](../interfaces/NodeWithScore.md)[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Defined in

[ResponseSynthesizer.ts:237](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/ResponseSynthesizer.ts#L237)
