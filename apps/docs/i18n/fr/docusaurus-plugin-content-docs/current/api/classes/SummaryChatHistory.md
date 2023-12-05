---
id: "SummaryChatHistory"
title: "Class: SummaryChatHistory"
sidebar_label: "SummaryChatHistory"
sidebar_position: 0
custom_edit_url: null
---

A ChatHistory is used to keep the state of back and forth chat messages

## Implements

- [`ChatHistory`](../interfaces/ChatHistory.md)

## Constructors

### constructor

• **new SummaryChatHistory**(`init?`)

#### Parameters

| Name    | Type                                                      |
| :------ | :-------------------------------------------------------- |
| `init?` | `Partial`<[`SummaryChatHistory`](SummaryChatHistory.md)\> |

#### Defined in

[packages/core/src/ChatHistory.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L70)

## Properties

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[packages/core/src/ChatHistory.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L67)

---

### messages

• **messages**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[messages](../interfaces/ChatHistory.md#messages)

#### Defined in

[packages/core/src/ChatHistory.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L65)

---

### messagesBefore

• `Private` **messagesBefore**: `number`

#### Defined in

[packages/core/src/ChatHistory.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L68)

---

### summaryPrompt

• **summaryPrompt**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Defined in

[packages/core/src/ChatHistory.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L66)

---

### tokensToSummarize

• **tokensToSummarize**: `number`

#### Defined in

[packages/core/src/ChatHistory.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L64)

## Accessors

### nonSystemMessages

• `Private` `get` **nonSystemMessages**(): [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatHistory.ts:127](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L127)

---

### systemMessages

• `Private` `get` **systemMessages**(): [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatHistory.ts:122](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L122)

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

[packages/core/src/ChatHistory.ts:106](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L106)

---

### calcConversationMessages

▸ `Private` **calcConversationMessages**(`transformSummary?`): [`ChatMessage`](../interfaces/ChatMessage.md)[]

Calculates the messages that describe the conversation so far.
If there's no memory, all non-system messages are used.
If there's a memory, uses all messages after the last summary message.

#### Parameters

| Name                | Type      |
| :------------------ | :-------- |
| `transformSummary?` | `boolean` |

#### Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatHistory.ts:137](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L137)

---

### calcCurrentRequestMessages

▸ `Private` **calcCurrentRequestMessages**(`transientMessages?`): [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Parameters

| Name                 | Type                                            |
| :------------------- | :---------------------------------------------- |
| `transientMessages?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatHistory.ts:155](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L155)

---

### getLastSummaryIndex

▸ `Private` **getLastSummaryIndex**(): `null` \| `number`

#### Returns

`null` \| `number`

#### Defined in

[packages/core/src/ChatHistory.ts:111](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L111)

---

### newMessages

▸ **newMessages**(): [`ChatMessage`](../interfaces/ChatMessage.md)[]

Returns the new messages since the last call to this function (or since calling the constructor)

#### Returns

[`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[newMessages](../interfaces/ChatHistory.md#newmessages)

#### Defined in

[packages/core/src/ChatHistory.ts:195](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L195)

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

[packages/core/src/ChatHistory.ts:165](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L165)

---

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatHistory](../interfaces/ChatHistory.md).[reset](../interfaces/ChatHistory.md#reset)

#### Defined in

[packages/core/src/ChatHistory.ts:191](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L191)

---

### summarize

▸ `Private` **summarize**(): `Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)\>

#### Defined in

[packages/core/src/ChatHistory.ts:84](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatHistory.ts#L84)
