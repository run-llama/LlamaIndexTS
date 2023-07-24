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

| Name | Type |
| :------ | :------ |
| `handlers?` | `CallbackManagerMethods` |

#### Defined in

[callbacks/CallbackManager.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/9fa6d4a/packages/core/src/callbacks/CallbackManager.ts#L68)

## Properties

### onLLMStream

• `Optional` **onLLMStream**: (`params`: [`StreamCallbackResponse`](../interfaces/StreamCallbackResponse.md)) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`params`): `void` \| `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`StreamCallbackResponse`](../interfaces/StreamCallbackResponse.md) |

##### Returns

`void` \| `Promise`<`void`\>

#### Implementation of

CallbackManagerMethods.onLLMStream

#### Defined in

[callbacks/CallbackManager.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/9fa6d4a/packages/core/src/callbacks/CallbackManager.ts#L65)

___

### onRetrieve

• `Optional` **onRetrieve**: (`params`: [`RetrievalCallbackResponse`](../interfaces/RetrievalCallbackResponse.md)) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`params`): `void` \| `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`RetrievalCallbackResponse`](../interfaces/RetrievalCallbackResponse.md) |

##### Returns

`void` \| `Promise`<`void`\>

#### Implementation of

CallbackManagerMethods.onRetrieve

#### Defined in

[callbacks/CallbackManager.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/9fa6d4a/packages/core/src/callbacks/CallbackManager.ts#L66)
