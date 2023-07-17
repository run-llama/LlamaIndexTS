---
id: "ChatGPTLLMPredictor"
title: "Class: ChatGPTLLMPredictor"
sidebar_label: "ChatGPTLLMPredictor"
sidebar_position: 0
custom_edit_url: null
---

ChatGPTLLMPredictor is a predictor that uses GPT.

## Implements

- [`BaseLLMPredictor`](../interfaces/BaseLLMPredictor.md)

## Constructors

### constructor

• **new ChatGPTLLMPredictor**(`props?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props?` | `Partial`<[`ChatGPTLLMPredictor`](ChatGPTLLMPredictor.md)\> |

#### Defined in

[LLMPredictor.ts:26](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/LLMPredictor.ts#L26)

## Properties

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[LLMPredictor.ts:24](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/LLMPredictor.ts#L24)

___

### languageModel

• **languageModel**: [`OpenAI`](OpenAI.md)

#### Defined in

[LLMPredictor.ts:23](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/LLMPredictor.ts#L23)

___

### model

• **model**: ``"gpt-3.5-turbo"`` \| ``"gpt-3.5-turbo-16k"`` \| ``"gpt-4"`` \| ``"gpt-4-32k"``

#### Defined in

[LLMPredictor.ts:21](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/LLMPredictor.ts#L21)

___

### retryOnThrottling

• **retryOnThrottling**: `boolean`

#### Defined in

[LLMPredictor.ts:22](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/LLMPredictor.ts#L22)

## Methods

### apredict

▸ **apredict**(`prompt`, `input?`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `prompt` | `string` \| [`SimplePrompt`](../modules.md#simpleprompt) |
| `input?` | `Record`<`string`, `string`\> |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Implementation of

[BaseLLMPredictor](../interfaces/BaseLLMPredictor.md).[apredict](../interfaces/BaseLLMPredictor.md#apredict)

#### Defined in

[LLMPredictor.ts:49](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/LLMPredictor.ts#L49)

___

### getLlmMetadata

▸ **getLlmMetadata**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Implementation of

[BaseLLMPredictor](../interfaces/BaseLLMPredictor.md).[getLlmMetadata](../interfaces/BaseLLMPredictor.md#getllmmetadata)

#### Defined in

[LLMPredictor.ts:45](https://github.com/run-llama/llamascript/blob/6ea89db/packages/core/src/LLMPredictor.ts#L45)
