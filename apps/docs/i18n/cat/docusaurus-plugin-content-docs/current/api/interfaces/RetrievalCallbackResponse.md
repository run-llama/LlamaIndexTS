---
id: "RetrievalCallbackResponse"
title: "Interface: RetrievalCallbackResponse"
sidebar_label: "RetrievalCallbackResponse"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- `BaseCallbackResponse`

  ↳ **`RetrievalCallbackResponse`**

## Properties

### event

• **event**: [`Event`](Event.md)

#### Inherited from

BaseCallbackResponse.event

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/callbacks/CallbackManager.ts#L20)

---

### nodes

• **nodes**: [`NodeWithScore`](NodeWithScore.md)<[`Metadata`](../#metadata)\>[]

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/callbacks/CallbackManager.ts#L65)

---

### query

• **query**: `string`

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/callbacks/CallbackManager.ts#L64)
