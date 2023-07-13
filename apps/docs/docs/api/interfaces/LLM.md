---
id: "LLM"
title: "Interface: LLM"
sidebar_label: "LLM"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`OpenAI`](../classes/OpenAI.md)

## Methods

### achat

▸ **achat**(`messages`): `Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `messages` | [`ChatMessage`](ChatMessage.md)[] |

#### Returns

`Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Defined in

[LLM.ts:28](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L28)

___

### acomplete

▸ **acomplete**(`prompt`): `Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `prompt` | `string` |

#### Returns

`Promise`<[`ChatResponse`](ChatResponse.md)\>

#### Defined in

[LLM.ts:29](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLM.ts#L29)
