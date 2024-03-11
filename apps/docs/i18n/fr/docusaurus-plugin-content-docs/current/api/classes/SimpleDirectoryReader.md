---
id: "SimpleDirectoryReader"
title: "Class: SimpleDirectoryReader"
sidebar_label: "SimpleDirectoryReader"
sidebar_position: 0
custom_edit_url: null
---

Read all of the documents in a directory.
By default, supports the list of file types
in the FILE_EXT_TO_READER map.

## Implements

- [`BaseReader`](../interfaces/BaseReader.md)

## Constructors

### constructor

• **new SimpleDirectoryReader**(`observer?`)

#### Parameters

| Name        | Type             |
| :---------- | :--------------- |
| `observer?` | `ReaderCallback` |

#### Defined in

[packages/core/src/readers/SimpleDirectoryReader.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleDirectoryReader.ts#L65)

## Properties

### observer

• `Private` `Optional` **observer**: `ReaderCallback`

#### Defined in

[packages/core/src/readers/SimpleDirectoryReader.ts:65](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleDirectoryReader.ts#L65)

## Methods

### doObserverCheck

▸ `Private` **doObserverCheck**(`category`, `name`, `status`, `message?`): `boolean`

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `category` | `"file"` \| `"directory"` |
| `name`     | `string`                  |
| `status`   | `ReaderStatus`            |
| `message?` | `string`                  |

#### Returns

`boolean`

#### Defined in

[packages/core/src/readers/SimpleDirectoryReader.ts:135](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleDirectoryReader.ts#L135)

---

### loadData

▸ **loadData**(`«destructured»`): `Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Parameters

| Name             | Type                                                                           |
| :--------------- | :----------------------------------------------------------------------------- |
| `«destructured»` | [`SimpleDirectoryReaderLoadDataProps`](../#simpledirectoryreaderloaddataprops) |

#### Returns

`Promise`<[`Document`](Document.md)<[`Metadata`](../#metadata)\>[]\>

#### Implementation of

[BaseReader](../interfaces/BaseReader.md).[loadData](../interfaces/BaseReader.md#loaddata)

#### Defined in

[packages/core/src/readers/SimpleDirectoryReader.ts:67](https://github.com/run-llama/LlamaIndexTS/blob/d613bbd/packages/core/src/readers/SimpleDirectoryReader.ts#L67)
