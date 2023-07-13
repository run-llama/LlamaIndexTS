---
id: "LLMQuestionGenerator"
title: "Class: LLMQuestionGenerator"
sidebar_label: "LLMQuestionGenerator"
sidebar_position: 0
custom_edit_url: null
---

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

[QuestionGenerator.ts:28](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/QuestionGenerator.ts#L28)

## Properties

### llmPredictor

• **llmPredictor**: [`BaseLLMPredictor`](../interfaces/BaseLLMPredictor.md)

#### Defined in

[QuestionGenerator.ts:24](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/QuestionGenerator.ts#L24)

___

### outputParser

• **outputParser**: [`BaseOutputParser`](../interfaces/BaseOutputParser.md)<[`StructuredOutput`](../interfaces/StructuredOutput.md)<[`SubQuestion`](../interfaces/SubQuestion.md)[]\>\>

#### Defined in

[QuestionGenerator.ts:26](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/QuestionGenerator.ts#L26)

___

### prompt

• **prompt**: [`SimplePrompt`](../modules.md#simpleprompt)

#### Defined in

[QuestionGenerator.ts:25](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/QuestionGenerator.ts#L25)

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

[QuestionGenerator.ts:34](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/QuestionGenerator.ts#L34)
