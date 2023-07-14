---
id: "SimpleResponseBuilder"
title: "Class: SimpleResponseBuilder"
sidebar_label: "SimpleResponseBuilder"
sidebar_position: 0
custom_edit_url: null
---

A response builder that just concatenates responses.

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

[ResponseSynthesizer.ts:37](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ResponseSynthesizer.ts#L37)

## Properties

### llmPredictor

• **llmPredictor**: [`BaseLLMPredictor`](../interfaces/BaseLLMPredictor.md)

#### Defined in

[ResponseSynthesizer.ts:34](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ResponseSynthesizer.ts#L34)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:35](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ResponseSynthesizer.ts#L35)

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

[ResponseSynthesizer.ts:43](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/ResponseSynthesizer.ts#L43)
