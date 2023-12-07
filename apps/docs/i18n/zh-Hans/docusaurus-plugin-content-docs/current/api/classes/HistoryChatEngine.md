---
id: "HistoryChatEngine"
title: "Class: HistoryChatEngine"
sidebar_label: "HistoryChatEngine"
sidebar_position: 0
custom_edit_url: null
---

HistoryChatEngine is a ChatEngine that uses a `ChatHistory` object
to keeps track of chat's message history.
A `ChatHistory` object is passed as a parameter for each call to the `chat` method,
so the state of the chat engine is preserved between calls.
Optionally, a `ContextGenerator` can be used to generate an additional context for each call to `chat`.

## Constructors

### constructor

• **new HistoryChatEngine**(`init?`)

#### Parameters

| Name    | Type                                                    |
| :------ | :------------------------------------------------------ |
| `init?` | `Partial`<[`HistoryChatEngine`](HistoryChatEngine.md)\> |

#### Defined in

[packages/core/src/ChatEngine.ts:381](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L381)

## Properties

### contextGenerator

• `Optional` **contextGenerator**: [`ContextGenerator`](../interfaces/ContextGenerator.md)

#### Defined in

[packages/core/src/ChatEngine.ts:379](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L379)

---

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[packages/core/src/ChatEngine.ts:378](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L378)

## Methods

### chat

▸ **chat**<`T`, `R`\>(`message`, `chatHistory`, `streaming?`): `Promise`<`R`\>

#### Type parameters

| Name | Type                                                                                            |
| :--- | :---------------------------------------------------------------------------------------------- |
| `T`  | extends `undefined` \| `boolean` = `undefined`                                                  |
| `R`  | `T` extends `true` ? `AsyncGenerator`<`string`, `void`, `unknown`\> : [`Response`](Response.md) |

#### Parameters

| Name          | Type                                          |
| :------------ | :-------------------------------------------- |
| `message`     | [`MessageContent`](../#messagecontent)        |
| `chatHistory` | [`ChatHistory`](../interfaces/ChatHistory.md) |
| `streaming?`  | `T`                                           |

#### Returns

`Promise`<`R`\>

#### Defined in

[packages/core/src/ChatEngine.ts:386](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L386)

---

### prepareRequestMessages

▸ `Private` **prepareRequestMessages**(`message`, `chatHistory`): `Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)[]\>

#### Parameters

| Name          | Type                                          |
| :------------ | :-------------------------------------------- |
| `message`     | [`MessageContent`](../#messagecontent)        |
| `chatHistory` | [`ChatHistory`](../interfaces/ChatHistory.md) |

#### Returns

`Promise`<[`ChatMessage`](../interfaces/ChatMessage.md)[]\>

#### Defined in

[packages/core/src/ChatEngine.ts:433](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L433)

---

### streamChat

▸ `Protected` **streamChat**(`message`, `chatHistory`): `AsyncGenerator`<`string`, `void`, `unknown`\>

#### Parameters

| Name          | Type                                          |
| :------------ | :-------------------------------------------- |
| `message`     | [`MessageContent`](../#messagecontent)        |
| `chatHistory` | [`ChatHistory`](../interfaces/ChatHistory.md) |

#### Returns

`AsyncGenerator`<`string`, `void`, `unknown`\>

#### Defined in

[packages/core/src/ChatEngine.ts:407](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L407)
