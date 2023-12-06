---
id: "HTMLReader"
title: "Class: HTMLReader"
sidebar_label: "HTMLReader"
sidebar_position: 0
custom_edit_url: null
---

Extract the significant text from an arbitrary HTML document.
The contents of any head, script, style, and xml tags are removed completely.
The URLs for a[href] tags are extracted, along with the inner text of the tag.
All other tags are removed, and the inner text is kept intact.
Html entities (e.g., &amp;) are not decoded.

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new HTMLReader**()

## Methods

### getOptions

▸ **getOptions**(): `Object`

Wrapper for our configuration options passed to string-strip-html library

#### Returns

`Object`

An object of options for the underlying library

| Name                             | Type       |
| :------------------------------- | :--------- |
| `skipHtmlDecoding`               | `boolean`  |
| `stripTogetherWithTheirContents` | `string`[] |

**`See`**

https://codsen.com/os/string-strip-html/examples

#### Defined in

[packages/core/src/readers/HTMLReader.ts:48](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/HTMLReader.ts#L48)

---

### loadData

▸ **loadData**(`file`, `fs?`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

Public method for this reader.
Required by BaseReader interface.

#### Parameters

| Name   | Type                                                      | Default value | Description                                        |
| :----- | :-------------------------------------------------------- | :------------ | :------------------------------------------------- |
| `file` | `string`                                                  | `undefined`   | Path/name of the file to be loaded.                |
| `fs`   | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS`  | fs wrapper interface for getting the file content. |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

Promise<Document[]> A Promise object, eventually yielding zero or one Document parsed from the HTML content of the specified file.

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[packages/core/src/readers/HTMLReader.ts:21](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/HTMLReader.ts#L21)

---

### parseContent

▸ **parseContent**(`html`, `options?`): `Promise`<`string`\>

Wrapper for string-strip-html usage.

#### Parameters

| Name      | Type     | Description                                     |
| :-------- | :------- | :---------------------------------------------- |
| `html`    | `string` | Raw HTML content to be parsed.                  |
| `options` | `any`    | An object of options for the underlying library |

#### Returns

`Promise`<`string`\>

The HTML content, stripped of unwanted tags and attributes

**`See`**

getOptions

#### Defined in

[packages/core/src/readers/HTMLReader.ts:38](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/HTMLReader.ts#L38)
