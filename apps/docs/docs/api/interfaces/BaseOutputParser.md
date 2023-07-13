---
id: "BaseOutputParser"
title: "Interface: BaseOutputParser<T>"
sidebar_label: "BaseOutputParser"
sidebar_position: 0
custom_edit_url: null
---

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

[OutputParser.ts:5](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/OutputParser.ts#L5)

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

[OutputParser.ts:4](https://github.com/run-llama/llamascript/blob/df4b1ad/packages/core/src/OutputParser.ts#L4)
