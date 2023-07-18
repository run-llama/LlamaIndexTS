---
id: "ContextChatEngine"
title: "Class: ContextChatEngine"
sidebar_label: "ContextChatEngine"
sidebar_position: 0
custom_edit_url: null
---

ContextChatEngine uses the Index to get the appropriate context for each query.
The context is stored in the system prompt, and the chat history is preserved,
ideally allowing the appropriate context to be surfaced for each query.

## Implements

- [`ChatEngine`](../interfaces/ChatEngine.md)

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

[ChatEngine.ts:138](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/ChatEngine.ts#L138)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:136](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/ChatEngine.ts#L136)

___

### chatModel

• **chatModel**: [`OpenAI`](OpenAI.md)

#### Defined in

[ChatEngine.ts:135](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/ChatEngine.ts#L135)

___

### retriever

• **retriever**: [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[ChatEngine.ts:134](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/ChatEngine.ts#L134)

## Methods

### achat

▸ **achat**(`message`, `chatHistory?`): `Promise`<[`Response`](Response.md)\>

Send message along with the class's current chat history to the LLM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` |  |
| `chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] | optional chat history if you want to customize the chat history |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[achat](../interfaces/ChatEngine.md#achat)

#### Defined in

[ChatEngine.ts:153](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/ChatEngine.ts#L153)

___

### chatRepl

▸ **chatRepl**(): `void`

#### Returns

`void`

#### Defined in

[ChatEngine.ts:149](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/ChatEngine.ts#L149)

___

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[reset](../interfaces/ChatEngine.md#reset)

#### Defined in

[ChatEngine.ts:191](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/ChatEngine.ts#L191)
