---
id: "SimpleChatEngine"
title: "Class: SimpleChatEngine"
sidebar_label: "SimpleChatEngine"
sidebar_position: 0
custom_edit_url: null
---

SimpleChatEngine is the simplest possible chat engine. Useful for using your own custom prompts.

## Implements

- [`ChatEngine`](../interfaces/ChatEngine.md)

## Constructors

### constructor

• **new SimpleChatEngine**(`init?`)

#### Parameters

| Name    | Type                                                  |
| :------ | :---------------------------------------------------- |
| `init?` | `Partial`<[`SimpleChatEngine`](SimpleChatEngine.md)\> |

#### Defined in

[packages/core/src/ChatEngine.ts:51](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L51)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatEngine.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L48)

---

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[packages/core/src/ChatEngine.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L49)

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

[packages/core/src/ChatEngine.ts:56](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L56)

---

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[reset](../interfaces/ChatEngine.md#reset)

#### Defined in

[packages/core/src/ChatEngine.ts:101](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L101)

---

### streamChat

▸ `Protected` **streamChat**(`message`, `chatHistory?`): `AsyncGenerator`<`string`, `void`, `unknown`\>

#### Parameters

| Name           | Type                                            |
| :------------- | :---------------------------------------------- |
| `message`      | [`MessageContent`](../#messagecontent)          |
| `chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`AsyncGenerator`<`string`, `void`, `unknown`\>

#### Defined in

[packages/core/src/ChatEngine.ts:78](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L78)
