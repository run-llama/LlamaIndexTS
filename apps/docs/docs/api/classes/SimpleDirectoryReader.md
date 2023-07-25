---
id: "SimpleDirectoryReader"
title: "Class: SimpleDirectoryReader"
sidebar_label: "SimpleDirectoryReader"
sidebar_position: 0
custom_edit_url: null
---

Read all of the documents in a directory. Currently supports PDF and TXT files.

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new SimpleDirectoryReader**()

## Methods

### loadData

▸ **loadData**(`«destructured»`): `Promise`<[`Document`](Document.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`SimpleDirectoryReaderLoadDataProps`](../modules.md#simpledirectoryreaderloaddataprops) |

#### Returns

`Promise`<[`Document`](Document.md)[]\>

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[readers/SimpleDirectoryReader.ts:37](https://github.com/run-llama/LlamaIndexTS/blob/68bdaaa/packages/core/src/readers/SimpleDirectoryReader.ts#L37)
