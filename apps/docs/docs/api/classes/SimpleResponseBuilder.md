---
id: "SimpleResponseBuilder"
title: "Class: SimpleResponseBuilder"
sidebar_label: "SimpleResponseBuilder"
sidebar_position: 0
custom_edit_url: null
---

## Implements

- `BaseResponseBuilder`

## Constructors

### constructor

• **new SimpleResponseBuilder**(`serviceContext?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext?` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[ResponseSynthesizer.ts:25](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L25)

## Properties

### llmPredictor

• **llmPredictor**: [`BaseLLMPredictor`](../interfaces/BaseLLMPredictor.md)

#### Defined in

[ResponseSynthesizer.ts:22](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L22)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:23](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L23)

## Methods

### agetResponse

▸ **agetResponse**(`query`, `textChunks`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Implementation of

BaseResponseBuilder.agetResponse

#### Defined in

[ResponseSynthesizer.ts:31](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/ResponseSynthesizer.ts#L31)
