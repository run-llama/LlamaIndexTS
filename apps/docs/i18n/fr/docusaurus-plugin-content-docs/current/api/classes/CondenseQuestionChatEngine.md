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

| Name                          | Type                                                  |
| :---------------------------- | :---------------------------------------------------- |
| `init`                        | `Object`                                              |
| `init.chatHistory`            | [`ChatMessage`](../interfaces/ChatMessage.md)[]       |
| `init.condenseMessagePrompt?` | (`__namedParameters`: `Object`) => `string`           |
| `init.queryEngine`            | [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md) |
| `init.serviceContext?`        | [`ServiceContext`](../interfaces/ServiceContext.md)   |

#### Defined in

[packages/core/src/ChatEngine.ts:122](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L122)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatEngine.ts:118](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L118)

---

### condenseMessagePrompt

• **condenseMessagePrompt**: (`__namedParameters`: `Object`) => `string`

#### Type declaration

▸ (`«destructured»`): `string`

##### Parameters

| Name             | Type     |
| :--------------- | :------- |
| `«destructured»` | `Object` |

##### Returns

`string`

#### Defined in

[packages/core/src/ChatEngine.ts:120](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L120)

---

### queryEngine

• **queryEngine**: [`BaseQueryEngine`](../interfaces/BaseQueryEngine.md)

#### Defined in

[packages/core/src/ChatEngine.ts:117](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L117)

---

### serviceContext

• **serviceContext**: [`ServiceContext`](../interfaces/ServiceContext.md)

#### Defined in

[packages/core/src/ChatEngine.ts:119](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L119)

## Methods

### chat

▸ **chat**<`T`, `R`\>(`message`, `chatHistory?`, `streaming?`): `Promise`<`R`\>

Send message along with the class's current chat history to the LLM.

#### Type parameters

| Name | Type                                                                                            |
| :--- | :---------------------------------------------------------------------------------------------- |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                  |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`Response`](Response.md) |

#### Parameters

| Name           | Type                                            | Description                                                        |
| :------------- | :---------------------------------------------- | :----------------------------------------------------------------- |
| `message`      | [`MessageContent`](../#messagecontent)          |                                                                    |
| `chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] | optional chat history if you want to customize the chat history    |
| `streaming?`   | `T`                                             | optional streaming flag, which auto-sets the return value if True. |

#### Returns

`Promise`<`R`\>

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[chat](../interfaces/ChatEngine.md#chat)

#### Defined in

[packages/core/src/ChatEngine.ts:147](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L147)

---

### condenseQuestion

▸ `Private` **condenseQuestion**(`chatHistory`, `question`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Parameters

| Name          | Type                                            |
| :------------ | :---------------------------------------------- |
| `chatHistory` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `question`    | `string`                                        |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Defined in

[packages/core/src/ChatEngine.ts:136](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L136)

---

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[reset](../interfaces/ChatEngine.md#reset)

#### Defined in

[packages/core/src/ChatEngine.ts:169](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/ChatEngine.ts#L169)
