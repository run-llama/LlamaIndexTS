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

| Name                        | Type                                                                |
| :-------------------------- | :------------------------------------------------------------------ |
| `init`                      | `Object`                                                            |
| `init.chatHistory?`         | [`ChatMessage`](../interfaces/ChatMessage.md)[]                     |
| `init.chatModel?`           | [`LLM`](../interfaces/LLM.md)                                       |
| `init.contextSystemPrompt?` | (`__namedParameters`: `Object`) => `string`                         |
| `init.nodePostprocessors?`  | [`BaseNodePostprocessor`](../interfaces/BaseNodePostprocessor.md)[] |
| `init.retriever`            | [`BaseRetriever`](../interfaces/BaseRetriever.md)                   |

#### Defined in

[packages/core/src/ChatEngine.ts:243](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L243)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[packages/core/src/ChatEngine.ts:240](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L240)

---

### chatModel

• **chatModel**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[packages/core/src/ChatEngine.ts:239](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L239)

---

### contextGenerator

• **contextGenerator**: [`ContextGenerator`](../interfaces/ContextGenerator.md)

#### Defined in

[packages/core/src/ChatEngine.ts:241](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L241)

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

[packages/core/src/ChatEngine.ts:259](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L259)

---

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[reset](../interfaces/ChatEngine.md#reset)

#### Defined in

[packages/core/src/ChatEngine.ts:336](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L336)

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

[packages/core/src/ChatEngine.ts:300](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/ChatEngine.ts#L300)
