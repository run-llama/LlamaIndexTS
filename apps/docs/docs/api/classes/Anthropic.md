---
id: "Anthropic"
title: "Class: Anthropic"
sidebar_label: "Anthropic"
sidebar_position: 0
custom_edit_url: null
---

Anthropic LLM implementation

## Implements

- [`LLM`](../interfaces/LLM.md)

## Constructors

### constructor

• **new Anthropic**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`Anthropic`](Anthropic.md)\> |

#### Defined in

[llm/LLM.ts:353](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L353)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[llm/LLM.ts:346](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L346)

___

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[llm/LLM.ts:351](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L351)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[llm/LLM.ts:347](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L347)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[llm/LLM.ts:343](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L343)

___

### model

• **model**: `string`

#### Defined in

[llm/LLM.ts:340](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L340)

___

### session

• **session**: `AnthropicSession`

#### Defined in

[llm/LLM.ts:349](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L349)

___

### temperature

• **temperature**: `number`

#### Defined in

[llm/LLM.ts:341](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L341)

___

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[llm/LLM.ts:348](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L348)

___

### topP

• **topP**: `number`

#### Defined in

[llm/LLM.ts:342](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L342)

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

[llm/LLM.ts:388](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L388)

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

[llm/LLM.ts:406](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L406)

___

### mapMessagesToPrompt

▸ **mapMessagesToPrompt**(`messages`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`string`

#### Defined in

[llm/LLM.ts:373](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L373)
