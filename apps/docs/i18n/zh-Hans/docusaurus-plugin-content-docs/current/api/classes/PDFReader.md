---
id: "PDFReader"
title: "Class: PDFReader"
sidebar_label: "PDFReader"
sidebar_position: 0
custom_edit_url: null
---

Read the text of a PDF

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new PDFReader**()

## Methods

### loadData

▸ **loadData**(`file`, `fs?`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name   | Type                                                      | Default value |
| :----- | :-------------------------------------------------------- | :------------ |
| `file` | `string`                                                  | `undefined`   |
| `fs`   | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS`  |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[packages/core/src/readers/PDFReader.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/3552de1/packages/core/src/readers/PDFReader.ts#L11)
