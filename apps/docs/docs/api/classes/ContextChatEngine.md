---
id: "ContextChatEngine"
title: "Class: ContextChatEngine"
sidebar_label: "ContextChatEngine"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- `ChatEngine`

## Constructors

### constructor

• **new ContextChatEngine**(`init`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | `Object` |
| `init.chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `init.chatModel?` | [`OpenAI`](OpenAI.md) |
| `init.retriever` | [`BaseRetriever`](../interfaces/BaseRetriever.md) |

#### Defined in

[ChatEngine.ts:119](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L119)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:117](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L117)

___

### chatModel

• **chatModel**: [`OpenAI`](OpenAI.md)

#### Defined in

[ChatEngine.ts:116](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L116)

___

### retriever

• **retriever**: [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[ChatEngine.ts:115](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L115)

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

[ChatEngine.ts:134](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L134)

___

### chatRepl

▸ **chatRepl**(): `void`

#### Returns

`void`

#### Implementation of

ChatEngine.chatRepl

#### Defined in

[ChatEngine.ts:130](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L130)

___

### reset

▸ **reset**(): `void`

#### Returns

`void`

#### Implementation of

ChatEngine.reset

#### Defined in

[ChatEngine.ts:172](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ChatEngine.ts#L172)
