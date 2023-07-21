---
id: "CondenseQuestionChatEngine"
title: "Class: CondenseQuestionChatEngine"
sidebar_label: "CondenseQuestionChatEngine"
sidebar_position: 0
custom_edit_url: null
---

CondenseQuestionChatEngine is used in conjunction with a Index (for example VectorStoreIndex).
It does two steps on taking a user's chat message: first, it condenses the chat message
with the previous chat history into a question with more context.
Then, it queries the underlying Index using the new question with context and returns
the response.
CondenseQuestionChatEngine performs well when the input is primarily questions about the
underlying data. It performs less well when the chat messages are not questions about the
data, or are very referential to previous context.

## Implements

- [`ChatEngine`](../interfaces/ChatEngine.md)

## Constructors

### constructor

• **new CondenseQuestionChatEngine**(`init`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init` | `Object` |
| `init.chatHistory` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `init.condenseMessagePrompt?` | [`SimplePrompt`](../modules.md#simpleprompt) |
| `init.queryEngine` | [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md) |
| `init.serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[ChatEngine.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L75)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L71)

___

### condenseMessagePrompt

• **condenseMessagePrompt**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ChatEngine.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L73)

___

### queryEngine

• **queryEngine**: [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[ChatEngine.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L70)

___

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[ChatEngine.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L72)

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

[ChatEngine.ts:100](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L100)

___

### condenseQuestion

▸ `Private` **condenseQuestion**(`chatHistory`, `question`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chatHistory` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `question` | `string` |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Defined in

[ChatEngine.ts:89](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L89)

___

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[reset](../interfaces/ChatEngine.md#reset)

#### Defined in

[ChatEngine.ts:118](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/ChatEngine.ts#L118)
