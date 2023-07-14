---
id: "SimpleChatEngine"
title: "Class: SimpleChatEngine"
sidebar_label: "SimpleChatEngine"
sidebar_position: 0
custom_edit_url: null
---

SimpleChatEngine is the simplest possible chat engine. Useful for using your own custom prompts.

## Implements

- `ChatEngine`

## Constructors

### constructor

• **new SimpleChatEngine**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`SimpleChatEngine`](SimpleChatEngine.md)\> |

#### Defined in

[ChatEngine.ts:40](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ChatEngine.ts#L40)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:37](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ChatEngine.ts#L37)

___

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[ChatEngine.ts:38](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ChatEngine.ts#L38)

## Methods

### achat

▸ **achat**(`message`, `chatHistory?`): `Promise`<[`Response`](Response.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

ChatEngine.achat

#### Defined in

[ChatEngine.ts:45](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ChatEngine.ts#L45)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Implementation of

ChatEngine.reset

#### Defined in

[ChatEngine.ts:54](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ChatEngine.ts#L54)
