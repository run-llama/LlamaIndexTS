---
id: "BaseLLMPredictor"
title: "Interface: BaseLLMPredictor"
sidebar_label: "BaseLLMPredictor"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`ChatGPTLLMPredictor`](../classes/ChatGPTLLMPredictor.md)

## Methods

### apredict

▸ **apredict**(`prompt`, `input?`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `prompt` | `string` \| [`SimplePrompt`](../modules.md#simpleprompt) |
| `input?` | `Record`<`string`, `string`\> |
| `parentEvent?` | [`Event`](Event.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[LLMPredictor.ts:8](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L8)

___

### getLlmMetadata

▸ **getLlmMetadata**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[LLMPredictor.ts:7](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L7)
