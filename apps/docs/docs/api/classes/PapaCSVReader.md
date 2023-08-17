---
id: "PapaCSVReader"
title: "Class: PapaCSVReader"
sidebar_label: "PapaCSVReader"
sidebar_position: 0
custom_edit_url: null
---

papaparse-based csv parser

**`Implements`**

BaseReader

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new PapaCSVReader**(`concatRows?`, `colJoiner?`, `rowJoiner?`, `papaConfig?`)

Constructs a new instance of the class.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `concatRows?` | `boolean` | `true` | whether to concatenate all rows into one document.If set to False, a Document will be created for each row.True by default. |
| `colJoiner?` | `string` | `", "` | - |
| `rowJoiner?` | `string` | `"\n"` | Separator to use for joining each row.Only used when `concat_rows=True`.Set to "\n" by default. |
| `papaConfig?` | `ParseConfig`<`any`, `undefined`\> | `undefined` | - |

#### Defined in

[readers/CSVReader.ts:23](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/CSVReader.ts#L23)

## Properties

### colJoiner

• `Private` **colJoiner**: `string`

#### Defined in

[readers/CSVReader.ts:13](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/CSVReader.ts#L13)

___

### concatRows

• `Private` **concatRows**: `boolean`

#### Defined in

[readers/CSVReader.ts:12](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/CSVReader.ts#L12)

___

### papaConfig

• `Private` `Optional` **papaConfig**: `ParseConfig`<`any`, `undefined`\>

#### Defined in

[readers/CSVReader.ts:15](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/CSVReader.ts#L15)

___

### rowJoiner

• `Private` **rowJoiner**: `string`

#### Defined in

[readers/CSVReader.ts:14](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/CSVReader.ts#L14)

## Methods

### loadData

▸ **loadData**(`file`, `fs?`): `Promise`<[`Document`](Document.md)[]\>

Loads data from csv files

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `file` | `string` | `undefined` | The path to the file to load. |
| `fs?` | [`GenericFileSystem`](../interfaces/GenericFileSystem.md) | `DEFAULT_FS` | The file system to use for reading the file. |

#### Returns

`Promise`<[`Document`](Document.md)[]\>

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[readers/CSVReader.ts:41](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/CSVReader.ts#L41)
