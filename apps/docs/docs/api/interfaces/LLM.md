---
id: "LLM"
title: "Interface: LLM"
sidebar_label: "LLM"
sidebar_position: 0
custom_edit_url: null
---

Unified language model interface

## Implemented by

- [`Anthropic`](../classes/Anthropic.md)
- [`LlamaDeuce`](../classes/LlamaDeuce.md)
- [`OpenAI`](../classes/OpenAI.md)

## Methods

### chat

▸ **chat**(`messages`, `parentEvent?`): `Promise`<[`ChatResponse`](ChatResponse.md)\>

Get a chat response from the LLM

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](ChatMessage.md)[] |
| `parentEvent?` | [`Event`](Event.md) |

#### Returns

`Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Defined in

[llm/LLM.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L49)

___

### complete

▸ **complete**(`prompt`, `parentEvent?`): `Promise`<[`ChatResponse`](ChatResponse.md)\>

Get a prompt completion from the LLM

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `prompt` | `string` | the prompt to complete |
| `parentEvent?` | [`Event`](Event.md) | - |

#### Returns

`Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Defined in

[llm/LLM.ts:55](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/llm/LLM.ts#L55)
