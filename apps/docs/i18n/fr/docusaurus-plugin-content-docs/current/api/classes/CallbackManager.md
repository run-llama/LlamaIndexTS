---
id: "CallbackManager"
title: "Class: CallbackManager"
sidebar_label: "CallbackManager"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- `CallbackManagerMethods`

## Constructors

### constructor

• **new CallbackManager**(`handlers?`)

#### Parameters

| Name        | Type                     |
| :---------- | :----------------------- |
| `handlers?` | `CallbackManagerMethods` |

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:86](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/callbacks/CallbackManager.ts#L86)

## Properties

### onLLMStream

• `Optional` **onLLMStream**: (`params`: [`StreamCallbackResponse`](../interfaces/StreamCallbackResponse.md)) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`params`): `void` \| `Promise`<`void`\>

##### Parameters

| Name     | Type                                                                |
| :------- | :------------------------------------------------------------------ |
| `params` | [`StreamCallbackResponse`](../interfaces/StreamCallbackResponse.md) |

##### Returns

`void` \| `Promise`<`void`\>

#### Implementation of

CallbackManagerMethods.onLLMStream

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:83](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/callbacks/CallbackManager.ts#L83)

---

### onRetrieve

• `Optional` **onRetrieve**: (`params`: [`RetrievalCallbackResponse`](../interfaces/RetrievalCallbackResponse.md)) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`params`): `void` \| `Promise`<`void`\>

##### Parameters

| Name     | Type                                                                      |
| :------- | :------------------------------------------------------------------------ |
| `params` | [`RetrievalCallbackResponse`](../interfaces/RetrievalCallbackResponse.md) |

##### Returns

`void` \| `Promise`<`void`\>

#### Implementation of

CallbackManagerMethods.onRetrieve

#### Defined in

[packages/core/src/callbacks/CallbackManager.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/callbacks/CallbackManager.ts#L84)
