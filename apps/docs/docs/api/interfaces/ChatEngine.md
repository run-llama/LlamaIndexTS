---
id: "ChatEngine"
title: "Interface: ChatEngine"
sidebar_label: "ChatEngine"
sidebar_position: 0
custom_edit_url: null
---

A ChatEngine is used to handle back and forth chats between the application and the LLM.

## Implemented by

- [`CondenseQuestionChatEngine`](../classes/CondenseQuestionChatEngine.md)
- [`ContextChatEngine`](../classes/ContextChatEngine.md)
- [`SimpleChatEngine`](../classes/SimpleChatEngine.md)

## Methods

### chat

▸ **chat**(`message`, `chatHistory?`): `Promise`<[`Response`](../classes/Response.md)\>

Send message along with the class's current chat history to the LLM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` |  |
| `chatHistory?` | [`ChatMessage`](ChatMessage.md)[] | optional chat history if you want to customize the chat history |

#### Returns

`Promise`<[`Response`](../classes/Response.md)\>

#### Defined in

[ChatEngine.ts:25](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L25)

___

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Defined in

[ChatEngine.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/ChatEngine.ts#L30)
