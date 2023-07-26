---
id: "TextFileReader"
title: "Class: TextFileReader"
sidebar_label: "TextFileReader"
sidebar_position: 0
custom_edit_url: null
---

Read a .txt file

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new TextFileReader**()

## Methods

### loadData

▸ **loadData**(`file`, `fs?`): `Promise`<[`Document`](Document.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `string` |
| `fs` | [`CompleteFileSystem`](../modules.md#completefilesystem) |

#### Returns

`Promise`<[`Document`](Document.md)[]\>

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[readers/SimpleDirectoryReader.ts:12](https://github.com/run-llama/LlamaIndexTS/blob/35f3030/packages/core/src/readers/SimpleDirectoryReader.ts#L12)
