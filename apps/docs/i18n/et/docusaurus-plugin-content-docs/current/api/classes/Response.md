---
id: "Response"
title: "Class: Response"
sidebar_label: "Response"
sidebar_position: 0
custom_edit_url: null
---

Respone is the output of a LLM

## Constructors

### constructor

• **new Response**(`response`, `sourceNodes?`)

#### Parameters

| Name           | Type                                                     |
| :------------- | :------------------------------------------------------- |
| `response`     | `string`                                                 |
| `sourceNodes?` | [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[] |

#### Defined in

[packages/core/src/Response.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Response.ts#L10)

## Properties

### response

• **response**: `string`

#### Defined in

[packages/core/src/Response.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Response.ts#L7)

---

### sourceNodes

• `Optional` **sourceNodes**: [`BaseNode`](BaseNode.md)<[`Metadata`](../#metadata)\>[]

#### Defined in

[packages/core/src/Response.ts:8](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Response.ts#L8)

## Methods

### getFormattedSources

▸ **getFormattedSources**(): `void`

#### Returns

`void`

#### Defined in

[packages/core/src/Response.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Response.ts#L15)

---

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[packages/core/src/Response.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/Response.ts#L19)
