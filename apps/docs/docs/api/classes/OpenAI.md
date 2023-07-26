---
id: "OpenAI"
title: "Class: OpenAI"
sidebar_label: "OpenAI"
sidebar_position: 0
custom_edit_url: null
---

OpenAI LLM implementation

## Implements

- [`LLM`](../interfaces/LLM.md)

## Constructors

### constructor

• **new OpenAI**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`OpenAI`](OpenAI.md)\> |

#### Defined in

[llm/LLM.ts:75](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L75)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[llm/LLM.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L68)

___

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[llm/LLM.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L73)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[llm/LLM.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L69)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[llm/LLM.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L65)

___

### model

• **model**: ``"gpt-3.5-turbo"`` \| ``"gpt-3.5-turbo-16k"`` \| ``"gpt-4"`` \| ``"gpt-4-32k"``

#### Defined in

[llm/LLM.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L63)

___

### session

• **session**: `OpenAISession`

#### Defined in

[llm/LLM.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L71)

___

### temperature

• **temperature**: `number`

#### Defined in

[llm/LLM.ts:64](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L64)

___

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[llm/LLM.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L70)

## Methods

### chat

▸ **chat**(`messages`, `parentEvent?`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

Get a chat response from the LLM

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Implementation of

[LLM](../interfaces/LLM.md).[chat](../interfaces/LLM.md#chat)

#### Defined in

[llm/LLM.ts:111](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L111)

___

### complete

▸ **complete**(`prompt`, `parentEvent?`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

Get a prompt completion from the LLM

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `prompt` | `string` | the prompt to complete |
| `parentEvent?` | [`Event`](../interfaces/Event.md) | - |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Implementation of

[LLM](../interfaces/LLM.md).[complete](../interfaces/LLM.md#complete)

#### Defined in

[llm/LLM.ts:149](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L149)

___

### mapMessageType

▸ **mapMessageType**(`messageType`): ``"function"`` \| ``"user"`` \| ``"assistant"`` \| ``"system"``

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageType` | `MessageType` |

#### Returns

``"function"`` \| ``"user"`` \| ``"assistant"`` \| ``"system"``

#### Defined in

[llm/LLM.ts:94](https://github.com/run-llama/LlamaIndexTS/blob/dc91f5f/packages/core/src/llm/LLM.ts#L94)
