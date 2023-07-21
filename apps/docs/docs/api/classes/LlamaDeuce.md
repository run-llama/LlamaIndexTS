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

[llm/LLM.ts:179](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L179)

## Properties

### maxTokens

• `Optional` **maxTokens**: `number`

#### Defined in

[llm/LLM.ts:176](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L176)

___

### model

• **model**: ``"Llama-2-70b-chat"`` \| ``"Llama-2-13b-chat"`` \| ``"Llama-2-7b-chat"``

#### Defined in

[llm/LLM.ts:174](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L174)

___

### replicateSession

• **replicateSession**: `ReplicateSession`

#### Defined in

[llm/LLM.ts:177](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L177)

___

### temperature

• **temperature**: `number`

#### Defined in

[llm/LLM.ts:175](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L175)

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

[llm/LLM.ts:199](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L199)

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

[llm/LLM.ts:224](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L224)

___

### mapMessageType

▸ **mapMessageType**(`messageType`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `messageType` | `MessageType` |

#### Returns

`string`

#### Defined in

[llm/LLM.ts:186](https://github.com/run-llama/LlamaIndexTS/blob/3cab956/packages/core/src/llm/LLM.ts#L186)
