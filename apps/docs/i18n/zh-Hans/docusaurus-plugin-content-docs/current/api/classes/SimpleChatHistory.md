---
id: "SimpleChatHistory"
title: "Class: SimpleChatHistory"
sidebar_label: "SimpleChatHistory"
sidebar_position: 0
custom_edit_url: null
---

A ChatHistory is used to keep the state of back and forth chat messages

## Implements

- [`ChatHistory`](../interfaces/ChatHistory.md)

## Constructors

### constructor

• **new SimpleChatHistory**(`init?`)

#### Parameters

| Name    | Type                                                    |
| :------ | :------------------------------------------------------ |
| `init?` | `Partial`<[`SimpleChatHistory`](SimpleChatHistory.md)\> |

#### Defined in

[packages/core/src/ChatHistory.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L39)

## Properties

### messages

• **messages**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[messages](../interfaces/ChatHistory.md#messages)

#### Defined in

[packages/core/src/ChatHistory.ts:36](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L36)

---

### messagesBefore

• `Private` **messagesBefore**: `number`

#### Defined in

[packages/core/src/ChatHistory.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L37)

## Methods

### addMessage

▸ **addMessage**(`message`): `void`

Adds a message to the chat history.

#### Parameters

| Name      | Type                                          |
| :-------- | :-------------------------------------------- |
| `message` | [`ChatMessage`](../interfaces/ChatMessage.md) |

#### Returns

`void`

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[addMessage](../interfaces/ChatHistory.md#addmessage)

#### Defined in

[packages/core/src/ChatHistory.ts:44](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L44)

---

### newMessages

▸ **newMessages**(): [`ChatMessage`](../interfaces/ChatMessage.md)[]

Returns the new messages since the last call to this function (or since calling the constructor)

#### Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[newMessages](../interfaces/ChatHistory.md#newmessages)

#### Defined in

[packages/core/src/ChatHistory.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L56)

---

### requestMessages

▸ **requestMessages**(`transientMessages?`): `Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)[]\>

Returns the messages that should be used as input to the LLM.

#### Parameters

| Name                 | Type                                            |
| :------------------- | :---------------------------------------------- |
| `transientMessages?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)[]\>

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[requestMessages](../interfaces/ChatHistory.md#requestmessages)

#### Defined in

[packages/core/src/ChatHistory.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L48)

---

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[reset](../interfaces/ChatHistory.md#reset)

#### Defined in

[packages/core/src/ChatHistory.ts:52](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatHistory.ts#L52)
