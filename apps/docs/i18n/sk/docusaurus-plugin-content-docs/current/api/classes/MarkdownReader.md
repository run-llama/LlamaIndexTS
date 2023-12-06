---
id: "MarkdownReader"
title: "Class: MarkdownReader"
sidebar_label: "MarkdownReader"
sidebar_position: 0
custom_edit_url: null
---

Extract text from markdown files.
Returns dictionary with keys as headers and values as the text between headers.

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new MarkdownReader**(`removeHyperlinks?`, `removeImages?`)

#### Parameters

| Name                | Type      | Default value | Description                                     |
| :------------------ | :-------- | :------------ | :---------------------------------------------- |
| `removeHyperlinks?` | `boolean` | `true`        | Indicates whether hyperlinks should be removed. |
| `removeImages?`     | `boolean` | `true`        | Indicates whether images should be removed.     |

#### Defined in

[packages/core/src/readers/MarkdownReader.ts:19](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L19)

## Properties

### \_removeHyperlinks

• `Private` **\_removeHyperlinks**: `boolean`

#### Defined in

[packages/core/src/readers/MarkdownReader.ts:12](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L12)

---

### \_removeImages

• `Private` **\_removeImages**: `boolean`

#### Defined in

[packages/core/src/readers/MarkdownReader.ts:13](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L13)

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

[packages/core/src/readers/MarkdownReader.ts:90](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L90)

---

### markdownToTups

▸ **markdownToTups**(`markdownText`): `MarkdownTuple`[]

Convert a markdown file to a dictionary.
The keys are the headers and the values are the text under each header.

#### Parameters

| Name           | Type     | Description                   |
| :------------- | :------- | :---------------------------- |
| `markdownText` | `string` | The markdown text to convert. |

#### Returns

`MarkdownTuple`[]

- An array of tuples, where each tuple contains a header (or null) and its corresponding text.

#### Defined in

[packages/core/src/readers/MarkdownReader.ts:30](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L30)

---

### parseTups

▸ **parseTups**(`content`): `MarkdownTuple`[]

#### Parameters

| Name      | Type     |
| :-------- | :------- |
| `content` | `string` |

#### Returns

`MarkdownTuple`[]

#### Defined in

[packages/core/src/readers/MarkdownReader.ts:79](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L79)

---

### removeHyperlinks

▸ **removeHyperlinks**(`content`): `string`

#### Parameters

| Name      | Type     |
| :-------- | :------- |
| `content` | `string` |

#### Returns

`string`

#### Defined in

[packages/core/src/readers/MarkdownReader.ts:74](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L74)

---

### removeImages

▸ **removeImages**(`content`): `string`

#### Parameters

| Name      | Type     |
| :-------- | :------- |
| `content` | `string` |

#### Returns

`string`

#### Defined in

[packages/core/src/readers/MarkdownReader.ts:69](https://github.com/run-llama/LlamaIndexTS/blob/f0be933/packages/core/src/readers/MarkdownReader.ts#L69)
