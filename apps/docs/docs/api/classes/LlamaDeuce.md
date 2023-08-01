---
id: "LlamaDeuce"
title: "Class: LlamaDeuce"
sidebar_label: "LlamaDeuce"
sidebar_position: 0
custom_edit_url: null
---

Llama2 LLM implementation

## Implements

- [`LLM`](../interfaces/LLM.md)

## Constructors

### constructor

• **new LlamaDeuce**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`LlamaDeuce`](LlamaDeuce.md)\> |

#### Defined in

[llm/LLM.ts:208](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L208)

## Properties

### chatStrategy

• **chatStrategy**: [`DeuceChatStrategy`](../enums/DeuceChatStrategy.md)

#### Defined in

[llm/LLM.ts:202](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L202)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[llm/LLM.ts:205](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L205)

___

### model

• **model**: ``"Llama-2-70b-chat"`` \| ``"Llama-2-13b-chat"`` \| ``"Llama-2-7b-chat"``

#### Defined in

[llm/LLM.ts:201](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L201)

___

### replicateSession

• **replicateSession**: `ReplicateSession`

#### Defined in

[llm/LLM.ts:206](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L206)

___

### temperature

• **temperature**: `number`

#### Defined in

[llm/LLM.ts:203](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L203)

___

### topP

• **topP**: `number`

#### Defined in

[llm/LLM.ts:204](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L204)

## Methods

### chat

▸ **chat**(`messages`, `_parentEvent?`): `Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

Get a chat response from the LLM

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `_parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<[`ChatResponse`](../interfaces/ChatResponse.md)\>

#### Implementation of

[LLM](../interfaces/LLM.md).[chat](../interfaces/LLM.md#chat)

#### Defined in

[llm/LLM.ts:299](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L299)

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

[llm/LLM.ts:326](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L326)

___

### mapMessageTypeA16Z

▸ **mapMessageTypeA16Z**(`messageType`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageType` | [`MessageType`](../modules.md#messagetype) |

#### Returns

`string`

#### Defined in

[llm/LLM.ts:240](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L240)

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

[llm/LLM.ts:217](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L217)

___

### mapMessagesToPromptA16Z

▸ **mapMessagesToPromptA16Z**(`messages`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`string`

#### Defined in

[llm/LLM.ts:229](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L229)

___

### mapMessagesToPromptMeta

▸ **mapMessagesToPromptMeta**(`messages`, `withBos?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] | `undefined` |
| `withBos` | `boolean` | `false` |

#### Returns

`string`

#### Defined in

[llm/LLM.ts:253](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L253)
