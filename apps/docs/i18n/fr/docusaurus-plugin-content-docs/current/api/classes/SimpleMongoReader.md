---
id: "SimpleMongoReader"
title: "Class: SimpleMongoReader"
sidebar_label: "SimpleMongoReader"
sidebar_position: 0
custom_edit_url: null
---

Read in from MongoDB

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new SimpleMongoReader**(`client`)

#### Parameters

| Name     | Type          |
| :------- | :------------ |
| `client` | `MongoClient` |

#### Defined in

[packages/core/src/readers/SimpleMongoReader.ts:11](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleMongoReader.ts#L11)

## Properties

### client

• `Private` **client**: `MongoClient`

#### Defined in

[packages/core/src/readers/SimpleMongoReader.ts:9](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleMongoReader.ts#L9)

## Methods

### flatten

▸ `Private` **flatten**(`texts`): `string`[]

Flattens an array of strings or string arrays into a single-dimensional array of strings.

#### Parameters

| Name    | Type                       | Description                                       |
| :------ | :------------------------- | :------------------------------------------------ |
| `texts` | (`string` \| `string`[])[] | The array of strings or string arrays to flatten. |

#### Returns

`string`[]

The flattened array of strings.

#### Defined in

[packages/core/src/readers/SimpleMongoReader.ts:20](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleMongoReader.ts#L20)

---

### loadData

▸ **loadData**(`dbName`, `collectionName`, `fieldNames?`, `separator?`, `filterQuery?`, `maxDocs?`, `metadataNames?`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

Loads data from MongoDB collection

#### Parameters

| Name             | Type                       | Default value | Description                                                                                    |
| :--------------- | :------------------------- | :------------ | :--------------------------------------------------------------------------------------------- |
| `dbName`         | `string`                   | `undefined`   | The name of the database to load.                                                              |
| `collectionName` | `string`                   | `undefined`   | The name of the collection to load.                                                            |
| `fieldNames`     | `string`[]                 | `undefined`   | An array of field names to retrieve from each document. Defaults to ["text"].                  |
| `separator`      | `string`                   | `""`          | The separator to join multiple field values. Defaults to an empty string.                      |
| `filterQuery`    | `Record`<`string`, `any`\> | `{}`          | Specific query, as specified by MongoDB NodeJS documentation.                                  |
| `maxDocs`        | `number`                   | `0`           | The maximum number of documents to retrieve. Defaults to 0 (retrieve all documents).           |
| `metadataNames?` | `string`[]                 | `undefined`   | An optional array of metadata field names. If specified extracts this information as metadata. |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

**`Throws`**

If a field specified in fieldNames or metadataNames is not found in a MongoDB document.

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[packages/core/src/readers/SimpleMongoReader.ts:39](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleMongoReader.ts#L39)
