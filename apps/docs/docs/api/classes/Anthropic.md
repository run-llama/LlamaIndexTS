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

[llm/LLM.ts:343](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L343)

## Properties

### apiKey

• `Optional` **apiKey**: `string` = `undefined`

#### Defined in

[llm/LLM.ts:336](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L336)

___

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[llm/LLM.ts:341](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L341)

___

### maxRetries

• **maxRetries**: `number`

#### Defined in

[llm/LLM.ts:337](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L337)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[llm/LLM.ts:333](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L333)

___

### model

• **model**: `string`

#### Defined in

[llm/LLM.ts:331](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L331)

___

### session

• **session**: `AnthropicSession`

#### Defined in

[llm/LLM.ts:339](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L339)

___

### temperature

• **temperature**: `number`

#### Defined in

[llm/LLM.ts:332](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L332)

___

### timeout

• `Optional` **timeout**: `number`

#### Defined in

[llm/LLM.ts:338](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L338)

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

[llm/LLM.ts:377](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L377)

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

[llm/LLM.ts:394](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L394)

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

[llm/LLM.ts:362](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L362)
