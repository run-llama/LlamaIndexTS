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

[llm/LLM.ts:266](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L266)

## Properties

### chatStrategy

• **chatStrategy**: [`DeuceChatStrategy`](../enums/DeuceChatStrategy.md)

#### Defined in

[llm/LLM.ts:260](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L260)

___

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[llm/LLM.ts:263](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L263)

___

### model

• **model**: ``"Llama-2-70b-chat-old"`` \| ``"Llama-2-70b-chat-4bit"`` \| ``"Llama-2-13b-chat"`` \| ``"Llama-2-13b-chat-4bit"`` \| ``"Llama-2-7b-chat"`` \| ``"Llama-2-7b-chat-4bit"``

#### Defined in

[llm/LLM.ts:259](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L259)

___

### replicateSession

• **replicateSession**: `ReplicateSession`

#### Defined in

[llm/LLM.ts:264](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L264)

___

### temperature

• **temperature**: `number`

#### Defined in

[llm/LLM.ts:261](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L261)

___

### topP

• **topP**: `number`

#### Defined in

[llm/LLM.ts:262](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L262)

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

[llm/LLM.ts:385](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L385)

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

[llm/LLM.ts:422](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L422)

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

[llm/LLM.ts:309](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L309)

___

### mapMessagesToPrompt

▸ **mapMessagesToPrompt**(`messages`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prompt` | `string` |
| `systemPrompt` | `undefined` \| `string` |

#### Defined in

[llm/LLM.ts:281](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L281)

___

### mapMessagesToPromptA16Z

▸ **mapMessagesToPromptA16Z**(`messages`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prompt` | `string` |
| `systemPrompt` | `undefined` |

#### Defined in

[llm/LLM.ts:295](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L295)

___

### mapMessagesToPromptMeta

▸ **mapMessagesToPromptMeta**(`messages`, `opts?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](../interfaces/ChatMessage.md)[] |
| `opts?` | `Object` |
| `opts.replicate4Bit?` | `boolean` |
| `opts.withBos?` | `boolean` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `prompt` | `string` |
| `systemPrompt` | `undefined` \| `string` |

#### Defined in

[llm/LLM.ts:322](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L322)
