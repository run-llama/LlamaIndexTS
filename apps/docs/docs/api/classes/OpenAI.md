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

[LLM.ts:76](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L76)

## Properties

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[LLM.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L74)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[LLM.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L69)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[LLM.ts:71](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L71)

___

### model

• **model**: ``"gpt-3.5-turbo"`` \| ``"gpt-3.5-turbo-16k"`` \| ``"gpt-4"`` \| ``"gpt-4-32k"``

#### Defined in

[LLM.ts:66](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L66)

___

### n

• **n**: `number` = `1`

#### Defined in

[LLM.ts:70](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L70)

___

### openAIKey

• **openAIKey**: ``null`` \| `string` = `null`

#### Defined in

[LLM.ts:72](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L72)

___

### requestTimeout

• **requestTimeout**: ``null`` \| `number`

#### Defined in

[LLM.ts:68](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L68)

___

### session

• **session**: `OpenAISession`

#### Defined in

[LLM.ts:73](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L73)

___

### temperature

• **temperature**: `number`

#### Defined in

[LLM.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L67)

## Methods

### achat

▸ **achat**(`messages`, `parentEvent?`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

Get a chat response from the LLM

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Implementation of

[LLM](../interfaces/LLM.md).[achat](../interfaces/LLM.md#achat)

#### Defined in

[LLM.ts:103](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L103)

___

### acomplete

▸ **acomplete**(`prompt`, `parentEvent?`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

Get a prompt completion from the LLM

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `prompt` | `string` | the prompt to complete |
| `parentEvent?` | [`Event`](../interfaces/Event.md) | - |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Implementation of

[LLM](../interfaces/LLM.md).[acomplete](../interfaces/LLM.md#acomplete)

#### Defined in

[LLM.ts:145](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L145)

___

### mapMessageType

▸ **mapMessageType**(`type`): `ChatCompletionRequestMessageRoleEnum`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | `MessageType` |

#### Returns

`ChatCompletionRequestMessageRoleEnum`

#### Defined in

[LLM.ts:88](https://github.com/run-llama/LlamaIndexTS/blob/f1d609d/packages/core/src/LLM.ts#L88)
