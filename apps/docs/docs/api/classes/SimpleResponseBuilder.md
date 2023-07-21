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

• **new SimpleResponseBuilder**(`serviceContext`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceContext` | [`ServiceContext`](../interfaces/ServiceContext.md) |

#### Defined in

[ResponseSynthesizer.ts:49](https://github.com/run-llama/LlamaIndexTS/blob/5a765aa/packages/core/src/ResponseSynthesizer.ts#L49)

## Properties

### llm

• **llm**: [`LLM`](../interfaces/LLM.md)

#### Defined in

[ResponseSynthesizer.ts:46](https://github.com/run-llama/LlamaIndexTS/blob/5a765aa/packages/core/src/ResponseSynthesizer.ts#L46)

___

### textQATemplate

• **textQATemplate**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[ResponseSynthesizer.ts:47](https://github.com/run-llama/LlamaIndexTS/blob/5a765aa/packages/core/src/ResponseSynthesizer.ts#L47)

## Methods

### getResponse

▸ **getResponse**(`query`, `textChunks`, `parentEvent?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `textChunks` | `string`[] |
| `parentEvent?` | [`Event`](../interfaces/Event.md) |

#### Returns

`Promise`<`string`\>

#### Implementation of

BaseResponseBuilder.getResponse

#### Defined in

[ResponseSynthesizer.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/5a765aa/packages/core/src/ResponseSynthesizer.ts#L54)
