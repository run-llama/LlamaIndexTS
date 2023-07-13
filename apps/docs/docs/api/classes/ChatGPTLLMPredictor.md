---
id: "ChatGPTLLMPredictor"
title: "Class: ChatGPTLLMPredictor"
sidebar_label: "ChatGPTLLMPredictor"
sidebar_position: 0
custom_edit_url: null
---

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

[LLMPredictor.ts:22](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L22)

## Properties

### callbackManager

• `Optional` **callbackManager**: [`CallbackManager`](CallbackManager.md)

#### Defined in

[LLMPredictor.ts:20](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L20)

___

### languageModel

• **languageModel**: [`OpenAI`](OpenAI.md)

#### Defined in

[LLMPredictor.ts:19](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L19)

___

### model

• **model**: ``"gpt-3.5-turbo"`` \| ``"gpt-3.5-turbo-16k"`` \| ``"gpt-4"`` \| ``"gpt-4-32k"``

#### Defined in

[LLMPredictor.ts:17](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L17)

___

### retryOnThrottling

• **retryOnThrottling**: `boolean`

#### Defined in

[LLMPredictor.ts:18](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L18)

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

[LLMPredictor.ts:45](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L45)

___

### getLlmMetadata

▸ **getLlmMetadata**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Implementation of

[BaseLLMPredictor](../interfaces/BaseLLMPredictor.md).[getLlmMetadata](../interfaces/BaseLLMPredictor.md#getllmmetadata)

#### Defined in

[LLMPredictor.ts:41](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/LLMPredictor.ts#L41)
