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

▸ **chat**<`T`, `R`\>(`message`, `chatHistory?`, `streaming?`): `Promise`<`R`\>

Send message along with the class's current chat history to the LLM.

#### Type parameters

| Name | Type                                                                                                       |
| :--- | :--------------------------------------------------------------------------------------------------------- |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                             |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`Response`](../classes/Response.md) |

#### Parameters

| Name           | Type                                   | Description                                                        |
| :------------- | :------------------------------------- | :----------------------------------------------------------------- |
| `message`      | [`MessageContent`](../#messagecontent) |                                                                    |
| `chatHistory?` | [`ChatMessage`](ChatMessage.md)[]      | optional chat history if you want to customize the chat history    |
| `streaming?`   | `T`                                    | optional streaming flag, which auto-sets the return value if True. |

#### Returns

`Promise`<`R`\>

#### Defined in

[packages/core/src/ChatEngine.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ChatEngine.ts#L29)

---

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Defined in

[packages/core/src/ChatEngine.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/ChatEngine.ts#L41)
