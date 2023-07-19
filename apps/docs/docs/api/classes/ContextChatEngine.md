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

[ChatEngine.ts:132](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L132)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:130](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L130)

___

### chatModel

• **chatModel**: [`OpenAI`](OpenAI.md)

#### Defined in

[ChatEngine.ts:129](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L129)

___

### retriever

• **retriever**: [`BaseRetriever`](../interfaces/BaseRetriever.md)

#### Defined in

[ChatEngine.ts:128](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L128)

## Methods

### chat

▸ **chat**(`message`, `chatHistory?`): `Promise`<[`Response`](Response.md)\>

Send message along with the class's current chat history to the LLM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` |  |
| `chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] | optional chat history if you want to customize the chat history |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[chat](../interfaces/ChatEngine.md#chat)

#### Defined in

[ChatEngine.ts:147](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L147)

___

### chatRepl

▸ **chatRepl**(): `void`

#### Returns

`void`

#### Defined in

[ChatEngine.ts:143](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L143)

___

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[reset](../interfaces/ChatEngine.md#reset)

#### Defined in

[ChatEngine.ts:185](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L185)
