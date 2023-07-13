---
id: "SimpleChatEngine"
title: "Class: SimpleChatEngine"
sidebar_label: "SimpleChatEngine"
sidebar_position: 0
custom_edit_url: null
---

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

[ChatEngine.ts:28](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L28)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:25](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L25)

___

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[ChatEngine.ts:26](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L26)

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

[ChatEngine.ts:37](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L37)

___

### chatRepl

▸ **chatRepl**(): `void`

#### Returns

`void`

#### Implementation of

ChatEngine.chatRepl

#### Defined in

[ChatEngine.ts:33](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L33)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Implementation of

ChatEngine.reset

#### Defined in

[ChatEngine.ts:46](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L46)
