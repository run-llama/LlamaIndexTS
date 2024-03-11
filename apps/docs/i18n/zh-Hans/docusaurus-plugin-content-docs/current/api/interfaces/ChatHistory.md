---
id: "ChatHistory"
title: "Interface: ChatHistory"
sidebar_label: "ChatHistory"
sidebar_position: 0
custom_edit_url: null
---

A ChatHistory is used to keep the state of back and forth chat messages

## Implemented by

- [`SimpleChatHistory`](../classes/SimpleChatHistory.md)
- [`SummaryChatHistory`](../classes/SummaryChatHistory.md)

## Properties

### messages

• **messages**: [`ChatMessage`](ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatHistory.ts:12](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L12)

## Methods

### addMessage

▸ **addMessage**(`message`): `void`

Adds a message to the chat history.

#### Parameters

| Name      | Type                            |
| :-------- | :------------------------------ |
| `message` | [`ChatMessage`](ChatMessage.md) |

#### Returns

`void`

#### Defined in

[packages/core/src/ChatHistory.ts:17](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L17)

---

### newMessages

▸ **newMessages**(): [`ChatMessage`](ChatMessage.md)[]

Returns the new messages since the last call to this function (or since calling the constructor)

#### Returns

[`ChatMessage`](ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatHistory.ts:32](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L32)

---

### requestMessages

▸ **requestMessages**(`transientMessages?`): `Promise`<[`ChatMessage`](ChatMessage.md)[]\>

Returns the messages that should be used as input to the LLM.

#### Parameters

| Name                 | Type                              |
| :------------------- | :-------------------------------- |
| `transientMessages?` | [`ChatMessage`](ChatMessage.md)[] |

#### Returns

`Promise`<[`ChatMessage`](ChatMessage.md)[]\>

#### Defined in

[packages/core/src/ChatHistory.ts:22](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L22)

---

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Defined in

[packages/core/src/ChatHistory.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L27)
