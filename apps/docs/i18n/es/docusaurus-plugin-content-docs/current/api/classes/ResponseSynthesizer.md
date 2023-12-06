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

| Name                 | Type                                                |
| :------------------- | :-------------------------------------------------- |
| `«destructured»`     | `Object`                                            |
| › `metadataMode?`    | [`MetadataMode`](../enums/MetadataMode.md)          |
| › `responseBuilder?` | `BaseResponseBuilder`                               |
| › `serviceContext?`  | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:295](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L295)

## Properties

### metadataMode

• **metadataMode**: [`MetadataMode`](../enums/MetadataMode.md)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:293](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L293)

---

### responseBuilder

• **responseBuilder**: `BaseResponseBuilder`

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:291](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L291)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:292](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L292)

## Methods

### synthesize

▸ **synthesize**(`query`, `nodesWithScore`, `parentEvent?`): `Promise`<[`Response`](Response.md)\>

#### Parameters

| Name             | Type                                                                             |
| :--------------- | :------------------------------------------------------------------------------- |
| `query`          | `string`                                                                         |
| `nodesWithScore` | [`NodeWithScore`](../interfaces/NodeWithScore.md)<[`Metadata`](../#metadata)\>[] |
| `parentEvent?`   | [`Event`](../interfaces/Event.md)                                                |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Defined in

[packages/core/src/ResponseSynthesizer.ts:310](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ResponseSynthesizer.ts#L310)
