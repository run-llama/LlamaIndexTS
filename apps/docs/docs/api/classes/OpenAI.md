---
id: "OpenAI"
title: "Class: OpenAI"
sidebar_label: "OpenAI"
sidebar_position: 0
custom_edit_url: null
---

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

[LLM.ts:58](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L58)

## Properties

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[LLM.ts:56](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L56)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[LLM.ts:51](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L51)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[LLM.ts:53](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L53)

___

### model

• **model**: ``"gpt-3.5-turbo"`` \| ``"gpt-3.5-turbo-16k"`` \| ``"gpt-4"`` \| ``"gpt-4-32k"``

#### Defined in

[LLM.ts:48](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L48)

___

### n

• **n**: `number` = `1`

#### Defined in

[LLM.ts:52](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L52)

___

### openAIKey

• **openAIKey**: ``null`` \| `string` = `null`

#### Defined in

[LLM.ts:54](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L54)

___

### requestTimeout

• **requestTimeout**: ``null`` \| `number`

#### Defined in

[LLM.ts:50](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L50)

___

### session

• **session**: `OpenAISession`

#### Defined in

[LLM.ts:55](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L55)

___

### temperature

• **temperature**: `number`

#### Defined in

[LLM.ts:49](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L49)

## Methods

### achat

▸ **achat**(`messages`, `parentEvent?`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

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

[LLM.ts:85](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L85)

___

### acomplete

▸ **acomplete**(`prompt`, `parentEvent?`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `prompt` | `string` |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Implementation of

[LLM](../interfaces/LLM.md).[acomplete](../interfaces/LLM.md#acomplete)

#### Defined in

[LLM.ts:127](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L127)

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

[LLM.ts:70](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L70)
