---
id: "SubQuestionOutputParser"
title: "Class: SubQuestionOutputParser"
sidebar_label: "SubQuestionOutputParser"
sidebar_position: 0
custom_edit_url: null
---

SubQuestionOutputParser is used to parse the output of the SubQuestionGenerator.

## Implements

- [`BaseOutputParser`](../interfaces/BaseOutputParser.md)<[`StructuredOutput`](../interfaces/StructuredOutput.md)<[`SubQuestion`](../interfaces/SubQuestion.md)[]\>\>

## Constructors

### constructor

• **new SubQuestionOutputParser**()

## Methods

### format

▸ **format**(`output`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `output` | `string` |

#### Returns

`string`

#### Implementation of

[BaseOutputParser](../interfaces/BaseOutputParser.md).[format](../interfaces/BaseOutputParser.md#format)

#### Defined in

[OutputParser.ts:97](https://github.com/run-llama/LlamaIndexTS/blob/50c0b04/packages/core/src/OutputParser.ts#L97)

___

### parse

▸ **parse**(`output`): [`StructuredOutput`](../interfaces/StructuredOutput.md)<[`SubQuestion`](../interfaces/SubQuestion.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `output` | `string` |

#### Returns

[`StructuredOutput`](../interfaces/StructuredOutput.md)<[`SubQuestion`](../interfaces/SubQuestion.md)[]\>

#### Implementation of

[BaseOutputParser](../interfaces/BaseOutputParser.md).[parse](../interfaces/BaseOutputParser.md#parse)

#### Defined in

[OutputParser.ts:89](https://github.com/run-llama/LlamaIndexTS/blob/50c0b04/packages/core/src/OutputParser.ts#L89)
