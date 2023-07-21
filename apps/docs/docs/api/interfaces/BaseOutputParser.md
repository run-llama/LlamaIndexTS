---
id: "BaseOutputParser"
title: "Interface: BaseOutputParser<T>"
sidebar_label: "BaseOutputParser"
sidebar_position: 0
custom_edit_url: null
---

An OutputParser is used to extract structured data from the raw output of the LLM.

## Type parameters

| Name |
| :------ |
| `T` |

## Implemented by

- [`SubQuestionOutputParser`](../classes/SubQuestionOutputParser.md)

## Methods

### format

▸ **format**(`output`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `output` | `string` |

#### Returns

`string`

#### Defined in

[OutputParser.ts:8](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/OutputParser.ts#L8)

___

### parse

▸ **parse**(`output`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `output` | `string` |

#### Returns

`T`

#### Defined in

[OutputParser.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/a07a941/packages/core/src/OutputParser.ts#L7)
