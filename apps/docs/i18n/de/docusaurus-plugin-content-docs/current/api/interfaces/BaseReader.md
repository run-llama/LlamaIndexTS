---
id: "BaseReader"
title: "Interface: BaseReader"
sidebar_label: "BaseReader"
sidebar_position: 0
custom_edit_url: null
---

A reader takes imports data into Document objects.

## Implemented by

- [`HTMLReader`](../classes/HTMLReader.md)
- [`MarkdownReader`](../classes/MarkdownReader.md)
- [`NotionReader`](../classes/NotionReader.md)
- [`PDFReader`](../classes/PDFReader.md)
- [`PapaCSVReader`](../classes/PapaCSVReader.md)
- [`SimpleDirectoryReader`](../classes/SimpleDirectoryReader.md)
- [`SimpleMongoReader`](../classes/SimpleMongoReader.md)
- [`TextFileReader`](../classes/TextFileReader.md)

## Methods

### loadData

▸ **loadData**(`...args`): `Promise`<[`Document`](../classes/Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name      | Type    |
| :-------- | :------ |
| `...args` | `any`[] |

#### Returns

`Promise`<[`Document`](../classes/Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Defined in

[packages/core/src/readers/base.ts:7](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/base.ts#L7)
