---
id: "LLMQuestionGenerator"
title: "Class: LLMQuestionGenerator"
sidebar_label: "LLMQuestionGenerator"
sidebar_position: 0
custom_edit_url: null
---

LLMQuestionGenerator uses the LLM to generate new questions for the LLM using tools and a user query.

## Implements

- [`BaseQuestionGenerator`](../interfaces/BaseQuestionGenerator.md)

## Constructors

### constructor

• **new LLMQuestionGenerator**(`init?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `init?` | `Partial`<[`LLMQuestionGenerator`](LLMQuestionGenerator.md)\> |

#### Defined in

[QuestionGenerator.ts:34](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/QuestionGenerator.ts#L34)

## Properties

### llmPredictor

• **llmPredictor**: [`BaseLLMPredictor`](../interfaces/BaseLLMPredictor.md)

#### Defined in

[QuestionGenerator.ts:30](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/QuestionGenerator.ts#L30)

___

### outputParser

• **outputParser**: [`BaseOutputParser`](../interfaces/BaseOutputParser.md)<[`StructuredOutput`](../interfaces/StructuredOutput.md)<[`SubQuestion`](../interfaces/SubQuestion.md)[]\>\>

#### Defined in

[QuestionGenerator.ts:32](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/QuestionGenerator.ts#L32)

___

### prompt

• **prompt**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[QuestionGenerator.ts:31](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/QuestionGenerator.ts#L31)

## Methods

### agenerate

▸ **agenerate**(`tools`, `query`): `Promise`<[`SubQuestion`](../interfaces/SubQuestion.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tools` | [`ToolMetadata`](../interfaces/ToolMetadata.md)[] |
| `query` | `string` |

#### Returns

`Promise`<[`SubQuestion`](../interfaces/SubQuestion.md)[]\>

#### Implementation of

[BaseQuestionGenerator](../interfaces/BaseQuestionGenerator.md).[agenerate](../interfaces/BaseQuestionGenerator.md#agenerate)

#### Defined in

[QuestionGenerator.ts:40](https://github.com/run-llama/llamascript/blob/4649536/packages/core/src/QuestionGenerator.ts#L40)
