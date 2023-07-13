---
id: "ResponseSynthesizer"
title: "Class: ResponseSynthesizer"
sidebar_label: "ResponseSynthesizer"
sidebar_position: 0
custom_edit_url: null
---

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

[ResponseSynthesizer.ts:202](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L202)

## Properties

### responseBuilder

• **responseBuilder**: `BaseResponseBuilder`

#### Defined in

[ResponseSynthesizer.ts:199](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L199)

___

### serviceContext

• `Optional` **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ResponseSynthesizer.ts:200](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L200)

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

[ResponseSynthesizer.ts:214](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L214)
