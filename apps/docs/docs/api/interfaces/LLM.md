---
id: "LLM"
title: "Interface: LLM"
sidebar_label: "LLM"
sidebar_position: 0
custom_edit_url: null
---

Unified language model interface

## Implemented by

- [`OpenAI`](../classes/OpenAI.md)

## Methods

### achat

▸ **achat**(`messages`): `Promise`<[`ChatResponse`](ChatResponse.md)\>

Get a chat response from the LLM

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](ChatMessage.md)[] |

#### Returns

`Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Defined in

[LLM.ts:35](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/LLM.ts#L35)

___

### acomplete

▸ **acomplete**(`prompt`): `Promise`<[`ChatResponse`](ChatResponse.md)\>

Get a prompt completion from the LLM

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `prompt` | `string` | the prompt to complete |

#### Returns

`Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Defined in

[LLM.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/e108757/packages/core/src/LLM.ts#L41)
