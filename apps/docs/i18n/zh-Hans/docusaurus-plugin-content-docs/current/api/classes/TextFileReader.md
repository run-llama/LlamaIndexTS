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

▸ **loadData**(`file`, `fs?`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name   | Type                                           |
| :----- | :--------------------------------------------- |
| `file` | `string`                                       |
| `fs`   | [`CompleteFileSystem`](../#completefilesystem) |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[packages/core/src/readers/SimpleDirectoryReader.ts:29](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/readers/SimpleDirectoryReader.ts#L29)
