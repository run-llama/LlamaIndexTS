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

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`SimpleChatEngine`](SimpleChatEngine.md)\> |

#### Defined in

[ChatEngine.ts:40](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/ChatEngine.ts#L40)

## Properties

### chatHistory

• **chatHistory**: [`ChatMessage`](../interfaces/ChatMessage.md)[]

#### Defined in

[ChatEngine.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/ChatEngine.ts#L37)

___

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[ChatEngine.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/ChatEngine.ts#L38)

## Methods

### achat

▸ **achat**(`message`, `chatHistory?`): `Promise`<[`Response`](Response.md)\>

Send message along with the class's current chat history to the LLM.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` |  |
| `chatHistory?` | [`ChatMessage`](../interfaces/ChatMessage.md)[] | optional chat history if you want to customize the chat history |

#### Returns

`Promise`<[`Response`](Response.md)\>

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[achat](../interfaces/ChatEngine.md#achat)

#### Defined in

[ChatEngine.ts:45](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/ChatEngine.ts#L45)

___

### reset

▸ **reset**(): `void`

Resets the chat history so that it's empty.

#### Returns

`void`

#### Implementation of

[ChatEngine](../interfaces/ChatEngine.md).[reset](../interfaces/ChatEngine.md#reset)

#### Defined in

[ChatEngine.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/1a39403/packages/core/src/ChatEngine.ts#L54)
