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

[llm/LLM.ts:466](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L466)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[llm/LLM.ts:459](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L459)

___

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[llm/LLM.ts:464](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L464)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[llm/LLM.ts:460](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L460)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[llm/LLM.ts:456](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L456)

___

### model

• **model**: `string`

#### Defined in

[llm/LLM.ts:453](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L453)

___

### session

• **session**: `AnthropicSession`

#### Defined in

[llm/LLM.ts:462](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L462)

___

### temperature

• **temperature**: `number`

#### Defined in

[llm/LLM.ts:454](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L454)

___

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[llm/LLM.ts:461](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L461)

___

### topP

• **topP**: `number`

#### Defined in

[llm/LLM.ts:455](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L455)

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

[llm/LLM.ts:501](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L501)

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

[llm/LLM.ts:519](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L519)

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

[llm/LLM.ts:486](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L486)
