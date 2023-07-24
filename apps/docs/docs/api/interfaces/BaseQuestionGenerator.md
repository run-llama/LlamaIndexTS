---
id: "BaseQuestionGenerator"
title: "Interface: BaseQuestionGenerator"
sidebar_label: "BaseQuestionGenerator"
sidebar_position: 0
custom_edit_url: null
---

QuestionGenerators generate new questions for the LLM using tools and a user query.

## Implemented by

- [`LLMQuestionGenerator`](../classes/LLMQuestionGenerator.md)

## Methods

### generate

▸ **generate**(`tools`, `query`): `Promise`<[`SubQuestion`](SubQuestion.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tools` | [`ToolMetadata`](ToolMetadata.md)[] |
| `query` | `string` |

#### Returns

`Promise`<[`SubQuestion`](SubQuestion.md)[]\>

#### Defined in

[QuestionGenerator.ts:23](https://github.com/run-llama/LlamaIndexTS/blob/80d3fc9/packages/core/src/QuestionGenerator.ts#L23)
