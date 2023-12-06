---
id: "NotionReader"
title: "Class: NotionReader"
sidebar_label: "NotionReader"
sidebar_position: 0
custom_edit_url: null
---

Notion pages are retrieved recursively and converted to Document objects.
Notion Database can also be loaded, and [the serialization method can be customized](https://github.com/TomPenguin/notion-md-crawler/tree/main).

[Note] To use this reader, must be created the Notion integration must be created in advance
Please refer to [this document](https://www.notion.so/help/create-integrations-with-the-notion-api) for details.

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new NotionReader**(`options`)

Constructor for the NotionReader class

#### Parameters

| Name      | Type                  | Description                          |
| :-------- | :-------------------- | :----------------------------------- |
| `options` | `NotionReaderOptions` | Configuration options for the reader |

#### Defined in

[packages/core/src/readers/NotionReader.ts:33](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/NotionReader.ts#L33)

## Properties

### crawl

• `Private` **crawl**: (`rootPageId`: `string`) => `Promise`<`Pages`\>

#### Type declaration

▸ (`rootPageId`): `Promise`<`Pages`\>

##### Parameters

| Name         | Type     |
| :----------- | :------- |
| `rootPageId` | `string` |

##### Returns

`Promise`<`Pages`\>

#### Defined in

[packages/core/src/readers/NotionReader.ts:27](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/NotionReader.ts#L27)

## Methods

### loadData

▸ **loadData**(`rootPageId`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

Loads recursively Notion pages and converts them to an array of Document objects

#### Parameters

| Name         | Type     | Description             |
| :----------- | :------- | :---------------------- |
| `rootPageId` | `string` | The root Notion page ID |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

A Promise that resolves to an array of Document objects

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[packages/core/src/readers/NotionReader.ts:63](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/NotionReader.ts#L63)

---

### loadPages

▸ **loadPages**(`rootPageId`): `Promise`<`Pages`\>

Loads recursively the Notion page with the specified root page ID.

#### Parameters

| Name         | Type     | Description             |
| :----------- | :------- | :---------------------- |
| `rootPageId` | `string` | The root Notion page ID |

#### Returns

`Promise`<`Pages`\>

A Promise that resolves to a Pages object(Convertible with the `toDocuments` method)

#### Defined in

[packages/core/src/readers/NotionReader.ts:54](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/NotionReader.ts#L54)

---

### toDocuments

▸ **toDocuments**(`pages`): [`Document`](Document.md)<[`Metadata`](../#metadata)\>[]

Converts Pages to an array of Document objects

#### Parameters

| Name    | Type    | Description                                               |
| :------ | :------ | :-------------------------------------------------------- |
| `pages` | `Pages` | The Notion pages to convert (Return value of `loadPages`) |

#### Returns

[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]

An array of Document objects

#### Defined in

[packages/core/src/readers/NotionReader.ts:42](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/NotionReader.ts#L42)
