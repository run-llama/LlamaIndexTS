---
id: "BaseLLMPredictor"
title: "Interface: BaseLLMPredictor"
sidebar_label: "BaseLLMPredictor"
sidebar_position: 0
custom_edit_url: null
---

LLM Predictors are an abstraction to predict the response to a prompt.

## Implemented by

- [`ChatGPTLLMPredictor`](../classes/ChatGPTLLMPredictor.md)

## Methods

### getLlmMetadata

▸ **getLlmMetadata**(): `Promise`<`any`\>

#### Returns

`Promise`<`any`\>

#### Defined in

[LLMPredictor.ts:9](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/LLMPredictor.ts#L9)

___

### predict

▸ **predict**(`prompt`, `input?`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `prompt` | `string` \| [`SimplePrompt`](../modules.md#simpleprompt) |
| `input?` | `Record`<`string`, `string`\> |
| `parentEvent?` | [`Event`](Event.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[LLMPredictor.ts:10](https://github.com/run-llama/LlamaIndexTS/blob/9d0cadf/packages/core/src/LLMPredictor.ts#L10)
